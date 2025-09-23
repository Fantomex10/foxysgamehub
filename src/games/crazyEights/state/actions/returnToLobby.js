import { prepareSeatedPlayer, prepareSpectator } from '../utils.js';

export const handleReturnToLobby = (state) => {
  if (state.phase === 'idle') {
    return state;
  }

  return {
    ...state,
    phase: 'roomLobby',
    hands: {},
    drawPile: [],
    discardPile: [],
    currentTurn: null,
    activeSuit: null,
    history: [],
    banner: 'Waiting for players to ready up…',
    players: state.players.map((player) => prepareSeatedPlayer(player)),
    spectators: (state.spectators ?? []).map((spectator) => prepareSpectator(spectator)),
  };
};
