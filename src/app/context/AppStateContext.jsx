import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { APP_PHASES } from '../constants.js';
import { getDefaultGameEngine, getGameEngineById, listGameEngines } from '../../games/index.js';
import { listPhotonAdapters, photonService, setPhotonAdapter } from '../../services/photonService.js';
import { usePhotonRoomState } from '../../hooks/usePhotonRoomState.js';
import { useDefaultPlayerInteraction } from '../../hooks/useDefaultPlayerInteraction.js';
import { listSessionAdapters, sessionService, setSessionAdapter } from '../../services/sessionService.js';
import { defaultServiceConfig, loadServiceConfig, persistServiceConfig } from '../../state/serviceConfig.js';
import { resolveEngineModules } from '../modules/engineModules.js';

const defaultEngine = getDefaultGameEngine();

const AppStateContext = createContext(null);

const composeLobbyEntry = (snapshot, engine) => {
  if (!snapshot?.roomId) return null;
  const host = snapshot.players?.find((player) => player.id === snapshot.hostId);
  return {
    id: snapshot.roomId,
    roomName: snapshot.roomName ?? `Room ${snapshot.roomId}`,
    engineId: engine.id,
    engineName: engine.name,
    hostName: host?.name ?? 'Host',
    playerCount: snapshot.players?.length ?? 0,
    spectatorCount: snapshot.spectators?.length ?? 0,
    maxPlayers: snapshot.roomSettings?.maxPlayers ?? snapshot.players?.length ?? 0,
    snapshot,
  };
};

export const AppStateProvider = ({ children }) => {
  const sessionAdapters = useMemo(() => listSessionAdapters(), []);
  const photonAdapters = useMemo(() => listPhotonAdapters(), []);

  const sanitiseServiceConfig = useCallback(
    (config = {}) => {
      const defaults = defaultServiceConfig();
      const next = { ...defaults, ...config };
      const sessionAdapter = sessionAdapters.includes(next.sessionAdapter)
        ? next.sessionAdapter
        : defaults.sessionAdapter;
      const photonAdapter = photonAdapters.includes(next.photonAdapter)
        ? next.photonAdapter
        : defaults.photonAdapter;
      return { sessionAdapter, photonAdapter };
    },
    [sessionAdapters, photonAdapters],
  );

  const [serviceConfig, setServiceConfigState] = useState(() => {
    const initial = sanitiseServiceConfig(loadServiceConfig());
    setSessionAdapter(initial.sessionAdapter);
    setPhotonAdapter(initial.photonAdapter);
    return initial;
  });

  const hasSyncedServiceConfigRef = useRef(false);
  const previousPhotonAdapterRef = useRef(serviceConfig.photonAdapter);
  const previousServiceConfigRef = useRef(serviceConfig);

  const [engine, setEngine] = useState(() => defaultEngine);
  const [photon, setPhoton] = useState(() => photonService.createClient(defaultEngine));
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [appPhase, setAppPhase] = useState(APP_PHASES.LOGIN);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [profileBlocked, setProfileBlocked] = useState(false);
  const [pendingCreateConfig, setPendingCreateConfig] = useState(null);

  useEffect(() => {
    const previous = previousServiceConfigRef.current;
    const changed = previous.sessionAdapter !== serviceConfig.sessionAdapter
      || previous.photonAdapter !== serviceConfig.photonAdapter;
    previousServiceConfigRef.current = serviceConfig;

    if (!hasSyncedServiceConfigRef.current) {
      hasSyncedServiceConfigRef.current = true;
      return;
    }

    if (!changed) {
      return;
    }

    setAvailableRooms([]);
    setPendingCreateConfig(null);
    setProfileBlocked(false);
    setAuthUser(null);
    setAuthReady(false);
    photon.resetSession();
    setAppPhase(APP_PHASES.LOGIN);
  }, [serviceConfig, photon]);

  const engines = useMemo(() => listGameEngines(), []);
  const gameOptions = useMemo(
    () => engines.map(({ id, name }) => ({ id, name })),
    [engines],
  );
  const engineModules = useMemo(() => resolveEngineModules(engine), [engine]);

  useEffect(() => {
    if (previousPhotonAdapterRef.current === serviceConfig.photonAdapter) {
      return;
    }
    previousPhotonAdapterRef.current = serviceConfig.photonAdapter;
    setPhoton((current) => {
      current?.disconnect?.();
      return photonService.createClient(engine);
    });
  }, [engine, serviceConfig.photonAdapter, setPhoton]);

  useEffect(() => () => {
    photon.disconnect?.();
  }, [photon]);

  useEffect(() => {
    let cancelled = false;
    setAuthReady(false);

    sessionService
      .ensureUserSession({
        fallbackUserId: photon.getState().userId,
        fallbackDisplayName: photon.getState().userName ?? '',
      })
      .then((user) => {
        if (cancelled) return;
        setAuthUser(user);
        setAuthReady(true);
      })
      .catch((error) => {
        console.warn('[Session] Falling back to offline mode', error);
        if (cancelled) return;
        const fallback = {
          uid: photon.getState().userId,
          displayName: photon.getState().userName ?? '',
          isOffline: true,
        };
        setAuthUser(fallback);
        setAuthReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [photon, serviceConfig.sessionAdapter]);

  const { state, profileLoaded } = usePhotonRoomState(photon, engine, authUser, {
    onProfileError: () => {
      setProfileBlocked(true);
      setAuthUser((previous) => (previous ? { ...previous, isOffline: true } : previous));
    },
    profileBlocked,
  });

  useEffect(() => {
    if (state.phase === 'finished' && state.gameOver) {
      setAppPhase(APP_PHASES.HUB);
      return;
    }

    if ((state.phase === 'roomLobby' || state.phase === 'playing' || state.phase === 'finished') && appPhase !== APP_PHASES.ROOM) {
      setAppPhase(APP_PHASES.ROOM);
    }
  }, [appPhase, state.phase, state.gameOver]);

  const performCreateLobby = useCallback(
    (config, selectedEngine) => {
      photon.setEngine(selectedEngine);

      if (!authUser?.uid) return;

      photon.createRoom({
        settings: {
          ...config.settings,
          roomName: config.roomName,
        },
        roomId: config.roomId,
      });

      const snapshot = photon.exportRoomSnapshot();
      const entry = composeLobbyEntry(snapshot, selectedEngine);
      if (entry) {
        setAvailableRooms((rooms) => {
          const exists = rooms.some((item) => item.id === entry.id);
          return exists ? rooms : [...rooms, entry];
        });
      }
    },
    [authUser, photon, setAvailableRooms],
  );

  useEffect(() => {
    if (!pendingCreateConfig || !profileLoaded) return;
    const selectedEngine = getGameEngineById(pendingCreateConfig.engineId) ?? engine;
    if (selectedEngine.id !== engine.id) {
      return;
    }
    performCreateLobby(pendingCreateConfig, selectedEngine);
    setPendingCreateConfig(null);
  }, [pendingCreateConfig, engine, profileLoaded, performCreateLobby]);

  useEffect(() => {
    if (state.phase === 'roomLobby' && state.hostId === state.userId) {
      const entry = composeLobbyEntry(photon.exportRoomSnapshot(), engine);
      if (!entry) return;
      setAvailableRooms((rooms) => {
        const index = rooms.findIndex((lobby) => lobby.id === entry.id);
        if (index === -1) {
          return [...rooms, entry];
        }
        const next = [...rooms];
        next[index] = entry;
        return next;
      });
    }
  }, [engine, photon, state.hostId, state.phase, state.players, state.roomId, state.roomName, state.roomSettings, state.userId]);

  const updateUserDisplayName = useCallback(
    (name) => {
      photon.setDisplayName(name);
      setAuthUser((previous) => (previous ? { ...previous, displayName: name } : previous));
    },
    [photon],
  );

  const handleCreateLobby = useCallback(
    (config) => {
      const selectedEngine = getGameEngineById(config.engineId) ?? engine;

      if (selectedEngine.id !== engine.id) {
        setPendingCreateConfig(config);
        setEngine(selectedEngine);
        return;
      }

      performCreateLobby(config, selectedEngine);
      setPendingCreateConfig(null);
    },
    [engine, performCreateLobby, setEngine, setPendingCreateConfig],
  );

  const handleJoinLobby = useCallback(
    (lobby) => {
      if (!authUser?.uid) return;

      const selectedEngine = getGameEngineById(lobby.engineId) ?? engine;
      if (selectedEngine.id !== engine.id) {
        setEngine(selectedEngine);
        photon.setEngine(selectedEngine);
      }

      const localName = state.userName?.trim() || authUser?.displayName || 'Player';
      photon.loadRoom(lobby.snapshot, { userId: authUser.uid, userName: localName });

      const updatedSnapshot = photon.exportRoomSnapshot();
      const entry = composeLobbyEntry(updatedSnapshot, selectedEngine);
      if (entry) {
        setAvailableRooms((rooms) => {
          const index = rooms.findIndex((item) => item.id === entry.id);
          if (index === -1) {
            return [...rooms, entry];
          }
          const next = [...rooms];
          next[index] = entry;
          return next;
        });
      }
    },
    [authUser, engine, photon, setAvailableRooms, setEngine, state.userName],
  );

  const handleQuickSelectGame = useCallback(
    (engineId) => {
      const nextEngine = getGameEngineById(engineId);
      if (!nextEngine || nextEngine.id === engine.id) {
        return;
      }

      const wasHost = state.hostId === state.userId;
      const desiredRoomName = state.roomName?.trim() || `${nextEngine.name} Lobby`;
      const displayName = state.userName?.trim() || authUser?.displayName || 'Player';

      setEngine(nextEngine);
      setAvailableRooms([]);

      if (displayName) {
        photon.setDisplayName(displayName);
      }

      if (wasHost) {
        setPendingCreateConfig({
          engineId: nextEngine.id,
          roomName: desiredRoomName,
          settings: { roomName: desiredRoomName },
          roomId: state.roomId,
        });
        setAppPhase(APP_PHASES.ROOM);
        return;
      }

      photon.resetSession();
      setAppPhase(APP_PHASES.HUB);
    },
    [
      authUser?.displayName,
      engine,
      photon,
      setAppPhase,
      setAvailableRooms,
      setEngine,
      setPendingCreateConfig,
      state.hostId,
      state.roomId,
      state.roomName,
      state.userId,
      state.userName,
    ],
  );

  const handleReturnToHub = useCallback(() => {
    if (state.roomId && state.hostId === state.userId) {
      setAvailableRooms((rooms) => rooms.filter((lobby) => lobby.id !== state.roomId));
    }
    photon.resetSession();
    setAppPhase(APP_PHASES.HUB);
  }, [photon, setAppPhase, setAvailableRooms, state.hostId, state.roomId, state.userId]);

  const drawCard = useCallback(() => {
    photon.drawCard(state.userId);
  }, [photon, state.userId]);

  const startGame = useCallback(() => {
    photon.startGame();
  }, [photon]);

  const updateServiceConfig = useCallback(
    (updater) => {
      setServiceConfigState((current) => {
        const candidate = typeof updater === 'function'
          ? updater(current)
          : { ...current, ...updater };
        const next = sanitiseServiceConfig(candidate);
        if (
          next.sessionAdapter === current.sessionAdapter
          && next.photonAdapter === current.photonAdapter
        ) {
          return current;
        }
        setSessionAdapter(next.sessionAdapter);
        setPhotonAdapter(next.photonAdapter);
        persistServiceConfig(next);
        return next;
      });
    },
    [sanitiseServiceConfig],
  );

  const interactionHook = engine.hooks?.usePlayerInteraction ?? useDefaultPlayerInteraction;
  const interaction = interactionHook({ state, photon, authUser, metadata: engine.metadata });

  const hand = interaction.hand ?? (state.hands[state.userId] ?? []);
  const handLocked = interaction.handLocked ?? false;
  const onPlayCard = interaction.onPlayCard ?? ((card) => photon.playCard(state.userId, card));
  const overlays = interaction.overlays ?? null;

  const playerDisplayName = authUser?.displayName?.trim() || state.userName || 'Player';
  const gameDisplayName = state.roomName || engine.name;

  const lobbyModule = engineModules.lobby ?? {};
  const tableModule = engineModules.table ?? {};
  const welcomeModule = engineModules.welcome ?? {};
  const LobbyComponent = lobbyModule.Component ?? (() => null);
  const TableComponent = tableModule.Component;
  const WelcomeComponent = welcomeModule.Component ?? (() => null);

  const roomActions = useMemo(
    () => ({
      updateUserDisplayName,
      createLobby: handleCreateLobby,
      joinLobby: handleJoinLobby,
      quickSelectGame: handleQuickSelectGame,
      returnToHub: handleReturnToHub,
      drawCard,
      startGame,
      toggleReady: (playerId) => photon.toggleReady(playerId),
      setPlayerStatus: (playerId, nextStatus) => photon.setPlayerStatus(playerId, nextStatus),
      updateSeatLayout: (layout) => photon.updateSeatLayout(layout),
      addBot: () => photon.addBot(),
      removeBot: () => photon.removeBot(),
      resetSession: () => photon.resetSession(),
      returnToLobby: () => photon.returnToLobby(),
    }),
    [
      updateUserDisplayName,
      handleCreateLobby,
      handleJoinLobby,
      handleQuickSelectGame,
      handleReturnToHub,
      drawCard,
      startGame,
      photon,
    ],
  );

  const contextValue = useMemo(
    () => ({
      engine,
      setEngine,
      engines,
      gameOptions,
      photon,
      authUser,
      authReady,
      appPhase,
      setAppPhase,
      availableRooms,
      profileBlocked,
      profileLoaded,
      state,
      hand,
      handLocked,
      onPlayCard,
      overlays,
      playerDisplayName,
      gameDisplayName,
      LobbyComponent,
      TableComponent,
      WelcomeComponent,
      engineModules,
      roomActions,
      serviceConfig,
      availableSessionAdapters: sessionAdapters,
      availablePhotonAdapters: photonAdapters,
      updateServiceConfig,
    }),
    [
      engine,
      engines,
      gameOptions,
      photon,
      authUser,
      authReady,
      appPhase,
      availableRooms,
      profileBlocked,
      profileLoaded,
      state,
      hand,
      handLocked,
      onPlayCard,
      overlays,
      playerDisplayName,
      gameDisplayName,
      LobbyComponent,
      TableComponent,
      WelcomeComponent,
      engineModules,
      roomActions,
      serviceConfig,
      sessionAdapters,
      photonAdapters,
      updateServiceConfig,
    ],
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
