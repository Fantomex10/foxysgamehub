import { useCallback, useMemo } from 'react';

export const useRoomActions = ({
  photon,
  state,
  updateUserDisplayName,
  createLobby,
  joinLobby,
  quickSelectGame,
  returnToHub,
}) => {
  const drawCard = useCallback(() => {
    photon.drawCard(state.userId);
  }, [photon, state.userId]);

  const startGame = useCallback(() => {
    photon.startGame();
  }, [photon]);

  return useMemo(
    () => ({
      updateUserDisplayName,
      createLobby,
      joinLobby,
      quickSelectGame,
      returnToHub,
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
      createLobby,
      joinLobby,
      quickSelectGame,
      returnToHub,
      drawCard,
      startGame,
      photon,
    ],
  );
};
