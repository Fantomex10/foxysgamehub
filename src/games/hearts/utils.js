import { RANKS } from '../../lib/cards.js';

const RANK_ORDER = [...RANKS].reverse();

export const rankValue = (card) => {
  const index = RANK_ORDER.indexOf(card.rank);
  return index === -1 ? -1 : index;
};

export const sortByRank = (cards, ascending = true) => {
  const multiplier = ascending ? 1 : -1;
  return [...cards].sort((a, b) => (rankValue(a) - rankValue(b)) * multiplier);
};

const isTwoOfClubs = (card) => card.rank === '2' && card.suit === 'clubs';
const isQueenOfSpades = (card) => card.rank === 'Q' && card.suit === 'spades';
const isHeart = (card) => card.suit === 'hearts';

export const getLegalMoves = (state, playerId) => {
  const hand = [...(state.hands[playerId] ?? [])];
  if (hand.length === 0) {
    return [];
  }

  const trick = state.trick ?? [];
  const trickCount = state.trickCount ?? 0;

  // Leading the trick
  if (trick.length === 0) {
    // First trick, must lead 2 of clubs
    if (trickCount === 0) {
      const twoClubs = hand.find(isTwoOfClubs);
      if (twoClubs) {
        return [twoClubs];
      }
    }

    let legal = [...hand];
    if (!state.heartsBroken) {
      const nonHearts = legal.filter((card) => !isHeart(card));
      if (nonHearts.length > 0) {
        legal = nonHearts;
      }
    }
    return legal;
  }

  const leadSuit = state.leadSuit;
  const followCards = hand.filter((card) => card.suit === leadSuit);
  if (followCards.length > 0) {
    // Must follow suit
    return followCards;
  }

  let legal = [...hand];
  if (trickCount === 0) {
    const nonPenalty = legal.filter((card) => !isHeart(card) && !isQueenOfSpades(card));
    if (nonPenalty.length > 0) {
      legal = nonPenalty;
    }
  }

  return legal;
};

export const calculateTrickWinner = (leadSuit, plays) => {
  if (!leadSuit || plays.length === 0) return null;
  const leadCards = plays.filter((entry) => entry.card.suit === leadSuit);
  if (leadCards.length === 0) return null;
  const sorted = [...leadCards].sort((a, b) => rankValue(b.card) - rankValue(a.card));
  return sorted[0].playerId;
};

export const countTrickPoints = (cards) => {
  return cards.reduce((total, card) => {
    if (card.suit === 'hearts') return total + 1;
    if (isQueenOfSpades(card)) return total + 13;
    return total;
  }, 0);
};

export const detectShootTheMoon = (captureMap) => {
  const totals = Object.entries(captureMap).map(([playerId, cards]) => ({
    playerId,
    points: countTrickPoints(cards ?? []),
  }));
  const shooter = totals.find((entry) => entry.points === 26);
  if (shooter) {
    return shooter.playerId;
  }
  return null;
};

export const heartsCardComparator = (a, b) => {
  const suitOrder = ['clubs', 'diamonds', 'spades', 'hearts'];
  const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
  if (suitDiff !== 0) return suitDiff;
  return rankValue(a) - rankValue(b);
};

export const sortHandForDisplay = (hand) => [...hand].sort(heartsCardComparator);

export const formatCard = (card) => `${card.rank}${card.suit.charAt(0).toUpperCase()}`;
