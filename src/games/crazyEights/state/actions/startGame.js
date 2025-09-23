import {
  dealHandsForPlayers,
  HAND_SIZE,
  pushHistory,
} from '../utils.js';

export const handleStartGame = (state) => {
  if (state.phase !== 'roomLobby') {
    return state;
  }

  const readyToStart = state.players.length >= 2
    && state.players.every((player) => player.isReady)
    && state.players.length <= (state.roomSettings?.maxPlayers ?? state.players.length);

  if (!readyToStart) {
    return {
      ...state,
      banner: 'Need at least two ready players to begin.',
    };
  }

  const { hands, drawPile, discardPile } = dealHandsForPlayers(state.players, HAND_SIZE);
  const firstPlayer = state.players[0];
  const startingSuit = discardPile.length ? discardPile[discardPile.length - 1].suit : null;
  const history = pushHistory([], `Game started. ${firstPlayer.name} goes first.`);

  return {
    ...state,
    phase: 'playing',
    hands,
    drawPile,
    discardPile,
    currentTurn: firstPlayer.id,
    activeSuit: startingSuit,
    history,
    banner: `${firstPlayer.name}'s turn`,
    players: state.players.map((player) => ({
      ...player,
      isReady: false,
      status: 'notReady',
    })),
  };
};
