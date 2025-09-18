import { useEffect, useMemo, useRef, useState } from 'react';
import { getDefaultGameEngine, getGameEngineById, listGameEngines } from './games/index.js';
import { createPhotonClient } from './services/photonClient.js';
import { ensureUserSession, fetchPlayerProfile, upsertPlayerProfile } from './services/firebaseClient.js';
import LoginHub from './components/LoginHub.jsx';
import HubMenu from './components/HubMenu.jsx';
import CreateLobbyForm from './components/CreateLobbyForm.jsx';
import JoinLobbyList from './components/JoinLobbyList.jsx';

const defaultEngine = getDefaultGameEngine();
const APP_PHASES = {
  LOGIN: 'login',
  HUB: 'hub',
  CREATE: 'create',
  JOIN: 'join',
  ROOM: 'room',
};

const useDefaultPlayerInteraction = ({ state, photon }) => {
  const [_placeholder] = useState(null);
  const hand = useMemo(() => state.hands[state.userId] ?? [], [state.hands, state.userId]);
  const isMyTurn = state.currentTurn === state.userId && state.phase === 'playing';
  const onPlayCard = (card) => {
    if (!isMyTurn) return;
    photon.playCard(state.userId, card);
  };
  return {
    hand,
    handLocked: !isMyTurn,
    onPlayCard,
    overlays: null,
  };
};

const usePhotonRoomState = (photon, engine, authUser, { onProfileError, profileBlocked } = {}) => {
  const [state, setState] = useState(() => photon.getState());
  const [profileLoaded, setProfileLoaded] = useState(false);
  const lastPersistedNameRef = useRef(null);

  useEffect(() => {
    if (!authUser) return undefined;

    setProfileLoaded(false);

    photon.setEngine(engine);

    photon.connect({
      userId: authUser.uid,
      userName: authUser.displayName ?? '',
      engineId: engine.id,
    });

    const unsubscribe = photon.subscribe((nextState) => {
      setState(nextState);
    });

    let cancelled = false;

    if (authUser.isOffline || profileBlocked) {
      setProfileLoaded(true);
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    fetchPlayerProfile(authUser.uid)
      .then((existingProfile) => {
        if (cancelled) return;
        if (existingProfile?.displayName) {
          lastPersistedNameRef.current = existingProfile.displayName;
          photon.setDisplayName(existingProfile.displayName);
        }
        setProfileLoaded(true);
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('[Firebase] Could not load player profile', error);
        setProfileLoaded(true);
        onProfileError?.();
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authUser, photon, engine, profileBlocked]);

  useEffect(() => {
    if (!authUser || authUser.isOffline || profileBlocked) return;
    const trimmedName = state.userName?.trim();
    if (!trimmedName || trimmedName === lastPersistedNameRef.current) {
      return;
    }
    upsertPlayerProfile(authUser.uid, { displayName: trimmedName })
      .then(() => {
        lastPersistedNameRef.current = trimmedName;
      })
      .catch((error) => {
        console.warn('[Firebase] Failed to persist display name', error);
        onProfileError?.();
      });
  }, [authUser, state.userName, engine, profileBlocked]);

  return { state, profileLoaded };
};

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
    maxPlayers: snapshot.roomSettings?.maxPlayers ?? snapshot.players?.length ?? 0,
    snapshot,
  };
};

function App() {
  const [engine, setEngine] = useState(() => defaultEngine);
  const [photon] = useState(() => createPhotonClient(engine));
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [appPhase, setAppPhase] = useState(APP_PHASES.LOGIN);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [profileBlocked, setProfileBlocked] = useState(false);
  const engines = useMemo(() => listGameEngines(), []);

  useEffect(() => {
    let cancelled = false;
    ensureUserSession()
      .then((user) => {
        if (cancelled) return;
        setAuthUser(user);
        setAuthReady(true);
      })
      .catch((error) => {
        console.warn('[Firebase] Falling back to offline mode', error);
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
  }, [photon]);

  const { state, profileLoaded } = usePhotonRoomState(photon, engine, authUser, {
    onProfileError: () => {
      setProfileBlocked(true);
      setAuthUser((prev) => (prev ? { ...prev, isOffline: true } : prev));
    },
    profileBlocked,
  });

  const useInteractionHook = engine.hooks?.usePlayerInteraction ?? useDefaultPlayerInteraction;
  const interaction = useInteractionHook({ state, photon, authUser, metadata: engine.metadata });

  const hand = interaction.hand ?? (state.hands[state.userId] ?? []);
  const handLocked = interaction.handLocked ?? false;
  const onPlayCard = interaction.onPlayCard ?? ((card) => photon.playCard(state.userId, card));
  const overlays = interaction.overlays ?? null;

  useEffect(() => {
    if (state.phase === 'finished' && state.gameOver) {
      setAppPhase(APP_PHASES.HUB);
      return;
    }

    if ((state.phase === 'roomLobby' || state.phase === 'playing' || state.phase === 'finished') && appPhase !== APP_PHASES.ROOM) {
      setAppPhase(APP_PHASES.ROOM);
      return;
    }

    if (appPhase === APP_PHASES.ROOM && state.phase === 'idle' && !state.roomId) {
      setAppPhase(APP_PHASES.HUB);
    }
  }, [appPhase, state.phase, state.roomId, state.gameOver]);

  const components = engine.components ?? {};
  const LobbyComponent = components.Lobby ?? (() => null);
  const TableComponent = components.Table;

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

  const updateUserDisplayName = (name) => {
    photon.setDisplayName(name);
    setAuthUser((previous) => (previous ? { ...previous, displayName: name } : previous));
  };

  const handleCreateLobby = (config) => {
    const selectedEngine = getGameEngineById(config.engineId) ?? engine;
    if (selectedEngine.id !== engine.id) {
      setEngine(selectedEngine);
      photon.setEngine(selectedEngine);
    }

    if (!authUser?.uid) return;

    photon.createRoom({
      settings: {
        ...config.settings,
        roomName: config.roomName,
      },
    });

    const snapshot = photon.exportRoomSnapshot();
    const entry = composeLobbyEntry(snapshot, selectedEngine);
    if (entry) {
      setAvailableRooms((rooms) => {
        const exists = rooms.some((item) => item.id === entry.id);
        return exists ? rooms : [...rooms, entry];
      });
    }

  };

  const handleJoinLobby = (lobby) => {
    if (!authUser?.uid) return;
    if (lobby.maxPlayers > 0 && lobby.playerCount >= lobby.maxPlayers) return;
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

  };

  const handleReturnToHub = () => {
    if (state.roomId && state.hostId === state.userId) {
      setAvailableRooms((rooms) => rooms.filter((lobby) => lobby.id !== state.roomId));
    }
    photon.resetSession();
    setAppPhase(APP_PHASES.HUB);
  };

  if (!authReady) {
    return (
      <div style={{ color: '#e2e8f0', textAlign: 'center', padding: '48px' }}>
        Establishing session…
      </div>
    );
  }

  if (!profileLoaded && appPhase === APP_PHASES.ROOM && !profileBlocked) {
    return (
      <div style={{ color: '#e2e8f0', textAlign: 'center', padding: '48px' }}>
        Synchronising profile…
      </div>
    );
  }

  if (!TableComponent) {
    return (
      <div style={{ color: '#f87171', textAlign: 'center', padding: '48px' }}>
        Engine "{engine.name}" is missing a Table component.
      </div>
    );
  }

  if (appPhase === APP_PHASES.LOGIN) {
    return (
      <LoginHub
        defaultName={authUser?.displayName ?? state.userName ?? ''}
        onSubmit={(value) => {
          updateUserDisplayName(value);
          setAppPhase(APP_PHASES.HUB);
        }}
      />
    );
  }

  if (appPhase === APP_PHASES.HUB) {
    return (
      <HubMenu
        onCreate={() => setAppPhase(APP_PHASES.CREATE)}
        onJoin={() => setAppPhase(APP_PHASES.JOIN)}
      />
    );
  }

  if (appPhase === APP_PHASES.CREATE) {
    return (
      <CreateLobbyForm
        engines={engines}
        defaultEngineId={engine.id}
        onCancel={() => setAppPhase(APP_PHASES.HUB)}
        onCreate={handleCreateLobby}
      />
    );
  }

  if (appPhase === APP_PHASES.JOIN) {
    return (
      <JoinLobbyList
        lobbies={availableRooms}
        onJoin={handleJoinLobby}
        onBack={() => setAppPhase(APP_PHASES.HUB)}
      />
    );
  }

  if (appPhase === APP_PHASES.ROOM && state.phase === 'idle') {
    return null;
  }

  if (appPhase === APP_PHASES.ROOM) {

    if (state.phase === 'roomLobby') {
      return (
        <LobbyComponent
          roomId={state.roomId}
          roomName={state.roomName}
          players={state.players}
          hostId={state.hostId}
          userId={state.userId}
          banner={state.banner}
          onToggleReady={(playerId) => photon.toggleReady(playerId)}
          onStart={() => photon.startGame()}
          onAddBot={() => photon.addBot()}
          onRemoveBot={() => photon.removeBot()}
          onReturnToWelcome={() => photon.resetSession()}
          onBackToHub={handleReturnToHub}
        />
      );
    }

    return (
      <>
        <TableComponent
          roomId={state.roomId}
          roomName={state.roomName}
          players={state.players}
          userId={state.userId}
          hostId={state.hostId}
          phase={state.phase}
          drawPile={state.drawPile}
          discardPile={state.discardPile}
          activeSuit={state.activeSuit}
          hand={hand}
          banner={state.banner}
          history={state.history}
          currentTurn={state.currentTurn}
          handLocked={handLocked}
          trick={state.trick}
          lastTrick={state.lastTrick}
          scores={state.scores}
          roundScores={state.roundScores}
          heartsBroken={state.heartsBroken}
          gameOver={state.gameOver}
          onPlayCard={onPlayCard}
          onDrawCard={() => photon.drawCard(state.userId)}
          onReturnToLobby={() => photon.returnToLobby()}
          onResetSession={() => photon.resetSession()}
          onReturnToHub={handleReturnToHub}
          onStartRound={() => photon.startGame()}
        />

        {overlays}
      </>
    );
  }

  return null;
}

export default App;
