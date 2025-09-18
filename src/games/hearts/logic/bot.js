import { getLegalMoves, rankValue } from '../utils.js';

const isHeart = (card) => card.suit === 'hearts';
const isQueenOfSpades = (card) => card.suit === 'spades' && card.rank === 'Q';

const pickLowest = (cards) =>
  [...cards].sort((a, b) => rankValue(a) - rankValue(b))[0] ?? cards[0];

const pickHighest = (cards) =>
  [...cards].sort((a, b) => rankValue(b) - rankValue(a))[0] ?? cards[0];

export const chooseHeartsBotMove = (state, botPlayer) => {
  const legal = getLegalMoves(state, botPlayer.id);
  if (!legal.length) {
    return null;
  }

  const trick = state.trick ?? [];
  const leadSuit = state.leadSuit;

  if (trick.length === 0) {
    // Lead with lowest legal card to avoid early points
    const choice = pickLowest(legal);
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: choice } };
  }

  const followSuitCards = legal.filter((card) => card.suit === leadSuit);
  if (followSuitCards.length > 0) {
    const choice = pickLowest(followSuitCards);
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: choice } };
  }

  const queenSpades = legal.find(isQueenOfSpades);
  if (queenSpades) {
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: queenSpades } };
  }

  const hearts = legal.filter(isHeart);
  if (hearts.length > 0) {
    const choice = pickHighest(hearts);
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: choice } };
  }

  const choice = pickHighest(legal);
  return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: choice } };
};
