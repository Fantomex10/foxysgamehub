import { SUITS } from '../../../lib/cards.js';

export const countSuitPreference = (hand) => {
  return SUITS.map((suit) => ({
    suit,
    count: hand.filter((card) => card.suit === suit).length,
  }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);
};

export const chooseBotMove = (state, botPlayer) => {
  const hand = state.hands[botPlayer.id] ?? [];
  if (hand.length === 0) {
    return { type: 'DRAW_CARD', payload: { playerId: botPlayer.id } };
  }

  const topCard = state.discardPile[state.discardPile.length - 1] ?? null;
  const activeSuit = state.activeSuit ?? topCard?.suit ?? null;

  const playable = hand.filter((card) => {
    if (card.rank === '8') return true;
    if (activeSuit && card.suit === activeSuit) return true;
    if (topCard && card.rank === topCard.rank) return true;
    return false;
  });

  if (playable.length === 0) {
    return { type: 'DRAW_CARD', payload: { playerId: botPlayer.id } };
  }

  const twos = playable.filter((card) => card.rank === '2');
  if (twos.length > 0) {
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: twos[0] } };
  }

  const suitMatches = playable.filter((card) => card.rank !== '8' && card.suit === activeSuit);
  if (suitMatches.length > 0) {
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: suitMatches[0] } };
  }

  const rankMatches = playable.filter(
    (card) => card.rank !== '8' && topCard && card.rank === topCard.rank,
  );
  if (rankMatches.length > 0) {
    return { type: 'PLAY_CARD', payload: { playerId: botPlayer.id, card: rankMatches[0] } };
  }

  const wilds = playable.filter((card) => card.rank === '8');
  if (wilds.length > 0) {
    const suitPreference = countSuitPreference(hand.filter((card) => card.id !== wilds[0].id));
    const preferredSuit = suitPreference.length > 0 ? suitPreference[0].suit : SUITS[0];
    return {
      type: 'PLAY_CARD',
      payload: { playerId: botPlayer.id, card: wilds[0], chosenSuit: preferredSuit },
    };
  }

  return { type: 'DRAW_CARD', payload: { playerId: botPlayer.id } };
};

export const pickSuitForHuman = (hand) => {
  const counts = countSuitPreference(hand);
  return counts.length > 0 ? counts[0].suit : SUITS[0];
};
