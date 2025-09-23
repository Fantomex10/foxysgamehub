import { STATUS_SEQUENCE } from '../utils.js';

export const handleSetPlayerStatus = (state, action) => {
  const { playerId, status } = action?.payload ?? {};
  if (!playerId || !STATUS_SEQUENCE.includes(status)) {
    return state;
  }

  const players = state.players.map((player) => {
    if (player.id !== playerId) {
      return player;
    }
    return {
      ...player,
      status,
      isReady: status === 'ready',
    };
  });

  return {
    ...state,
    players,
  };
};
