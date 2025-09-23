import {
  findPlayer,
  getNextPlayerId,
  isCardPlayable,
  normaliseSuit,
  pushHistory,
  recycleDrawPileIfNeeded,
} from '../utils.js';
import { createTrickEngine } from '../../../shared/trickEngine/index.js';

const describePlay = (context) => {
  const playerName = context.getPlayer()?.name ?? 'Player';
  const { rank, suit } = context.card;
  return `${playerName} played ${rank} of ${suit}.`;
};

const validateCard = (context) => {
  const topCard = context.initialState.discardPile?.[context.initialState.discardPile.length - 1] ?? null;
  if (!isCardPlayable(context.card, topCard, context.initialState.activeSuit)) {
    return {
      ...context.initialState,
      banner: 'Invalid card. Match suit or rank.',
    };
  }
  return null;
};

const onCardPlayed = (context) => {
  const state = context.state;
  const player = context.getPlayer();

  let drawPile = [...(state.drawPile ?? [])];
  let discardPile = [...(state.discardPile ?? []), context.card];
  const hands = { ...state.hands };

  let activeSuit = context.card.suit;
  let phase = state.phase;
  let nextTurn = getNextPlayerId(state.players, context.playerId);
  let banner = state.banner;

  if (context.card.rank === '8') {
    const declaredSuit = normaliseSuit(context.chosenSuit) ?? context.card.suit;
    activeSuit = declaredSuit;
    context.pushHistory(`Suit declared to ${declaredSuit.toUpperCase()}.`);
  }

  if (context.nextHand.length === 0) {
    const winnerName = player?.name ?? 'Player';
    const historyName = player?.name ?? 'A player';
    phase = 'finished';
    nextTurn = null;
    banner = `${winnerName} wins!`;
    context.pushHistory(`${historyName} won the round.`);

    context.mergeMeta({ nextTurn, banner, activeSuit, phase });
    context.assign({ drawPile, discardPile, hands });
    return context.state;
  }

  if (context.card.rank === '2' && nextTurn) {
    let workingDiscard = discardPile;
    const recycle = recycleDrawPileIfNeeded(drawPile, workingDiscard);
    drawPile = recycle.drawPile;
    workingDiscard = recycle.discardPile;
    discardPile = workingDiscard;

    if (recycle.reshuffled) {
      context.pushHistory('Reshuffled discard pile into the deck.');
    }

    const penaltyPlayerId = nextTurn;
    const penaltyHand = [...(hands[penaltyPlayerId] ?? state.hands?.[penaltyPlayerId] ?? [])];
    let cardsDrawn = 0;
    for (let i = 0; i < 2; i += 1) {
      if (drawPile.length === 0) break;
      penaltyHand.push(drawPile.shift());
      cardsDrawn += 1;
    }

    hands[penaltyPlayerId] = penaltyHand;
    const penaltyPlayer = context.getPlayer(penaltyPlayerId);
    const penaltyName = penaltyPlayer?.name ?? 'Player';

    if (cardsDrawn > 0) {
      context.pushHistory(`${penaltyName} drew ${cardsDrawn} cards from penalty.`);
    } else {
      context.pushHistory(`${penaltyName} could not draw penalty cards.`);
    }

    nextTurn = getNextPlayerId(state.players, penaltyPlayerId);
  }

  const nextPlayer = nextTurn ? context.getPlayer(nextTurn) : null;
  banner = `${nextPlayer?.name ?? 'Next player'}'s turn`;

  context.mergeMeta({ nextTurn, banner, activeSuit, phase });
  context.assign({
    drawPile,
    discardPile,
    hands,
  });

  return context.state;
};

const finalize = (context) => {
  const updates = {};
  if (Object.prototype.hasOwnProperty.call(context.meta, 'activeSuit')) {
    updates.activeSuit = context.meta.activeSuit;
  }
  if (Object.prototype.hasOwnProperty.call(context.meta, 'nextTurn')) {
    updates.currentTurn = context.meta.nextTurn;
  }
  if (Object.prototype.hasOwnProperty.call(context.meta, 'banner')) {
    updates.banner = context.meta.banner;
  }
  if (Object.prototype.hasOwnProperty.call(context.meta, 'phase')) {
    updates.phase = context.meta.phase;
  }

  if (Object.keys(updates).length > 0) {
    return context.assign(updates);
  }

  return context.state;
};

export const handlePlayCard = createTrickEngine({
  pushHistory,
  findPlayer,
  describePlay,
  validateCard,
  onCardPlayed,
  finalize,
});
