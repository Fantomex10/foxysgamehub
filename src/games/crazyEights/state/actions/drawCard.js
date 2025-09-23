import {
  findPlayer,
  getNextPlayerId,
  pushHistory,
  recycleDrawPileIfNeeded,
} from '../utils.js';

export const handleDrawCard = (state, action) => {
  if (state.phase !== 'playing') {
    return state;
  }

  const { playerId } = action?.payload ?? {};
  if (!playerId || state.currentTurn !== playerId) {
    return state;
  }

  let drawPile = [...state.drawPile];
  let discardPile = [...state.discardPile];
  let history = state.history;

  const recycleResult = recycleDrawPileIfNeeded(drawPile, discardPile);
  drawPile = recycleResult.drawPile;
  discardPile = recycleResult.discardPile;
  if (recycleResult.reshuffled) {
    history = pushHistory(history, 'Reshuffled discard pile into the deck.');
  }

  if (drawPile.length === 0) {
    return {
      ...state,
      history: pushHistory(history, 'No cards left to draw.'),
      banner: 'Deck empty. Cannot draw.',
    };
  }

  const drawnCard = drawPile.shift();
  const playerHand = [...(state.hands[playerId] ?? [])];
  playerHand.push(drawnCard);
  const updatedHands = { ...state.hands, [playerId]: playerHand };
  const player = findPlayer(state.players, playerId);

  history = pushHistory(history, `${player?.name ?? 'Player'} drew a card.`);

  const currentTurn = getNextPlayerId(state.players, playerId);
  const nextPlayer = findPlayer(state.players, currentTurn);
  const banner = `${nextPlayer?.name ?? 'Next player'}'s turn`;

  return {
    ...state,
    hands: updatedHands,
    drawPile,
    discardPile,
    currentTurn,
    activeSuit: state.activeSuit,
    history,
    banner,
  };
};
