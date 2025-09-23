import { getNextStatus, normaliseStatus } from '../utils.js';

export const handleToggleReady = (state, action) => {
  const { playerId } = action?.payload ?? {};
  if (!playerId) {
    return state;
  }

  const players = state.players.map((player) => {
    if (player.id !== playerId) {
      return player;
    }
    const currentStatus = normaliseStatus(player);
    const nextStatus = getNextStatus(currentStatus);
    return {
      ...player,
      status: nextStatus,
      isReady: nextStatus === 'ready',
    };
  });

  return {
    ...state,
    players,
  };
};
