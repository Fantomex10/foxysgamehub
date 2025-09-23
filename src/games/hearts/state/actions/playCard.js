import {
  calculateTrickWinner,
  countTrickPoints,
  detectShootTheMoon,
  getLegalMoves,
} from '../../utils.js';
import {
  appendCapture,
  ensureScores,
  findPlayer,
  pushHistory,
  REQUIRED_PLAYERS,
} from '../utils.js';
import { createTrickEngine } from '../../../shared/trickEngine/index.js';

const describePlay = (context) => {
  const playerName = context.getPlayer()?.name ?? 'Player';
  const { rank, suit } = context.card;
  return `${playerName} played ${rank} of ${suit}.`;
};

const validateCard = (context) => {
  const legalMoves = getLegalMoves(context.initialState, context.playerId);
  if (!legalMoves.some((legal) => legal.id === context.card.id)) {
    return {
      ...context.initialState,
      banner: 'Illegal card for this trick.',
    };
  }
  return null;
};

const onCardPlayed = (context) => {
  const state = context.state;
  const trick = [...(state.trick ?? []), { playerId: context.playerId, card: context.card }];
  const leadSuit = state.leadSuit ?? context.card.suit;
  const heartsBroken = state.heartsBroken || context.card.suit === 'hearts';

  const currentIndex = context.getPlayerIndex();
  const players = state.players ?? [];
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % players.length;
  const nextPlayerId = players[nextIndex]?.id ?? null;
  const nextPlayerName = nextPlayerId ? (context.getPlayer(nextPlayerId)?.name ?? 'Player') : 'Player';

  context.assign({
    trick,
    leadSuit,
    heartsBroken,
    lastTrick: [],
  });

  context.mergeMeta({
    nextTurn: nextPlayerId,
    banner: `${nextPlayerName} to play.`,
  });

  return context.state;
};

const isTrickComplete = (context) => {
  return (context.state.trick?.length ?? 0) === REQUIRED_PLAYERS
    ? { trick: context.state.trick }
    : null;
};

const onTrickComplete = (context, detail) => {
  const trick = detail?.trick ?? context.state.trick ?? [];
  const leadSuit = context.state.leadSuit ?? trick[0]?.card?.suit ?? null;
  const winnerId = calculateTrickWinner(leadSuit, trick) ?? context.playerId;
  const trickCards = trick.map((entry) => entry.card);
  const trickPoints = countTrickPoints(trickCards);

  const trickCaptures = appendCapture(context.state.trickCaptures, winnerId, trickCards);
  const roundScores = {
    ...context.state.roundScores,
    [winnerId]: (context.state.roundScores?.[winnerId] ?? 0) + trickPoints,
  };
  const trickCount = (context.state.trickCount ?? 0) + 1;
  const handsRemaining = Object.values(context.state.hands ?? {})
    .reduce((total, cards) => total + cards.length, 0);

  const winnerName = context.getPlayer(winnerId)?.name ?? 'Player';
  context.pushHistory(`${winnerName} captured the trick (${trickPoints} pts).`);

  context.assign({
    trick: [],
    leadSuit: null,
    trickCaptures,
    trickCount,
    roundScores,
    lastTrick: trick,
  });

  context.mergeMeta({
    nextTurn: winnerId,
    banner: `${winnerName} leads the next trick.`,
    trickWinner: winnerId,
    handsRemaining,
    roundComplete: handsRemaining === 0,
  });

  return context.state;
};

const isRoundComplete = (context) => (
  context.meta.roundComplete ? { handsRemaining: context.meta.handsRemaining } : null
);

const onRoundComplete = (context) => {
  const state = context.state;
  const trickCaptures = state.trickCaptures;
  const shootMoonPlayer = detectShootTheMoon(trickCaptures);
  const baseScores = ensureScores(state);
  const updatedScores = { ...baseScores };

  if (shootMoonPlayer) {
    for (const player of state.players ?? []) {
      if (player.id === shootMoonPlayer) continue;
      updatedScores[player.id] += 26;
    }
    const shooterName = context.getPlayer(shootMoonPlayer)?.name ?? 'Player';
    context.pushHistory(`${shooterName} shot the moon!`);
  } else {
    for (const player of state.players ?? []) {
      updatedScores[player.id] += state.roundScores?.[player.id] ?? 0;
    }
  }

  const scoreValues = Object.values(updatedScores);
  const maxScore = Math.max(...scoreValues);
  const gameOver = maxScore >= 100;

  let banner;
  if (gameOver) {
    const minScore = Math.min(...scoreValues);
    const winners = (state.players ?? [])
      .filter((player) => updatedScores[player.id] === minScore)
      .map((player) => player.name)
      .join(', ');
    banner = `Game over. ${winners} win${winners.includes(',') ? '' : 's'}!`;
  } else {
    banner = 'Round complete. Host can start a new round.';
  }

  context.assign({
    scores: updatedScores,
    trick: [],
    leadSuit: null,
    currentTurn: null,
    phase: 'finished',
    banner,
    gameOver,
  });

  context.mergeMeta({
    nextTurn: null,
    banner,
    phase: 'finished',
    gameOver,
  });

  return context.state;
};

const finalize = (context) => {
  const updates = {};
  if (Object.prototype.hasOwnProperty.call(context.meta, 'nextTurn')) {
    updates.currentTurn = context.meta.nextTurn;
  }
  if (Object.prototype.hasOwnProperty.call(context.meta, 'banner')) {
    updates.banner = context.meta.banner;
  }
  if (Object.prototype.hasOwnProperty.call(context.meta, 'phase')) {
    updates.phase = context.meta.phase;
  }
  if (Object.prototype.hasOwnProperty.call(context.meta, 'gameOver')) {
    updates.gameOver = context.meta.gameOver;
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
  isTrickComplete,
  onTrickComplete,
  isRoundComplete,
  onRoundComplete,
  finalize,
});
