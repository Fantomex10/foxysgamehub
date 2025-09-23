import { useCallback, useEffect } from 'react';
import { getGameEngineById } from '../../games/index.js';
import { APP_PHASES } from '../constants.js';
import { composeLobbyEntry } from '../lib/lobbyEntries.js';
import { useLobbySnapshots } from './useLobbySnapshots.js';
import { usePendingLobbyTransfer } from './usePendingLobbyTransfer.js';

export const useLobbyManager = ({
  photon,
  engine,
  authUser,
  state,
  profileLoaded,
  setEngine,
  setAppPhase,
}) => {
  const {
    availableRooms,
    upsertRoom,
    addRoomIfMissing,
    removeRoom,
    resetRooms,
  } = useLobbySnapshots();

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
      addRoomIfMissing(entry);
    },
    [authUser?.uid, photon, addRoomIfMissing],
  );

  const {
    requestTransfer,
    clearPending,
  } = usePendingLobbyTransfer({
    engine,
    profileLoaded,
    setEngine,
    performCreateLobby,
  });

  useEffect(() => {
    if (state.phase === 'roomLobby' && state.hostId === state.userId) {
      const entry = composeLobbyEntry(photon.exportRoomSnapshot(), engine);
      if (!entry) return;
      upsertRoom(entry);
    }
  }, [
    engine,
    photon,
    state.hostId,
    state.phase,
    state.players,
    state.roomId,
    state.roomName,
    state.roomSettings,
    state.userId,
    upsertRoom,
  ]);

  const handleCreateLobby = useCallback(
    (config) => {
      const { queued, targetEngine } = requestTransfer(config);
      if (queued) {
        return;
      }

      performCreateLobby(config, targetEngine);
      clearPending();
    },
    [performCreateLobby, requestTransfer, clearPending],
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
      upsertRoom(entry);
    },
    [authUser, engine, photon, setEngine, state.userName, upsertRoom],
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
      resetRooms();

      if (displayName) {
        photon.setDisplayName(displayName);
      }

      if (wasHost) {
        requestTransfer({
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
      requestTransfer,
      setAppPhase,
      setEngine,
      state.hostId,
      state.roomId,
      state.roomName,
      state.userId,
      state.userName,
      resetRooms,
    ],
  );

  const handleReturnToHub = useCallback(() => {
    if (state.roomId && state.hostId === state.userId) {
      removeRoom(state.roomId);
    }
    photon.resetSession();
    setAppPhase(APP_PHASES.HUB);
  }, [photon, removeRoom, setAppPhase, state.hostId, state.roomId, state.userId]);

  const resetLobbyState = useCallback(() => {
    resetRooms();
    clearPending();
  }, [resetRooms, clearPending]);

  return {
    availableRooms,
    createLobby: handleCreateLobby,
    joinLobby: handleJoinLobby,
    quickSelectGame: handleQuickSelectGame,
    returnToHub: handleReturnToHub,
    resetLobbyState,
  };
};
