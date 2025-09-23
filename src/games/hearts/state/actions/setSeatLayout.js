import {
  clampSeatLimit,
  prepareSeatedPlayer,
  prepareSpectator,
  ensureScores,
} from '../utils.js';

export const handleSetSeatLayout = (state, action) => {
  if (state.phase !== 'roomLobby') {
    return state;
  }

  const seatLimit = clampSeatLimit();
  const kickedIds = Array.isArray(action?.payload?.kickedIds)
    ? action.payload.kickedIds.filter((id) => typeof id === 'string')
    : [];
  const kickedSet = new Set(kickedIds);
  if (state.hostId) {
    kickedSet.delete(state.hostId);
  }

  const seatOrder = Array.isArray(action?.payload?.seatOrder)
    ? action.payload.seatOrder.filter((id) => !kickedSet.has(id))
    : [];
  const benchOrder = Array.isArray(action?.payload?.benchOrder)
    ? action.payload.benchOrder.filter((id) => !kickedSet.has(id))
    : [];
  const spectators = Array.isArray(state.spectators) ? state.spectators : [];

  const playerMap = new Map();
  state.players.forEach((player) => {
    if (!kickedSet.has(player.id)) {
      playerMap.set(player.id, player);
    }
  });
  spectators.forEach((spectator) => {
    if (!kickedSet.has(spectator.id)) {
      playerMap.set(spectator.id, spectator);
    }
  });

  if (!playerMap.has(state.userId) && state.userName && !kickedSet.has(state.userId)) {
    playerMap.set(state.userId, {
      id: state.userId,
      name: state.userName.trim() || 'Player',
      isBot: false,
      isHost: state.hostId === state.userId,
      isReady: false,
      status: 'notReady',
      isSpectator: false,
    });
  }

  const orderedSeatIds = [];
  const pushSeat = (id) => {
    if (!playerMap.has(id)) return;
    if (orderedSeatIds.includes(id)) return;
    orderedSeatIds.push(id);
  };

  seatOrder.forEach(pushSeat);

  if (state.hostId && playerMap.has(state.hostId) && !orderedSeatIds.includes(state.hostId)) {
    orderedSeatIds.unshift(state.hostId);
  }

  for (const player of state.players) {
    if (kickedSet.has(player.id)) continue;
    if (orderedSeatIds.length >= seatLimit) break;
    pushSeat(player.id);
  }

  if (orderedSeatIds.length > seatLimit) {
    orderedSeatIds.splice(seatLimit);
  }

  if (orderedSeatIds.length === 0) {
    const fallback = state.hostId && playerMap.has(state.hostId)
      ? state.hostId
      : state.players[0]?.id ?? Array.from(playerMap.keys())[0];
    if (fallback) {
      orderedSeatIds.push(fallback);
    }
  }

  const seatSet = new Set(orderedSeatIds);
  const orderedBenchIds = [];
  const pushBench = (id) => {
    if (!playerMap.has(id)) return;
    if (seatSet.has(id)) return;
    if (orderedBenchIds.includes(id)) return;
    orderedBenchIds.push(id);
  };

  benchOrder.forEach(pushBench);
  playerMap.forEach((_, id) => {
    pushBench(id);
  });

  const nextPlayers = orderedSeatIds
    .map((id) => playerMap.get(id))
    .filter(Boolean)
    .map((player) => prepareSeatedPlayer(player));

  const nextSpectators = orderedBenchIds
    .map((id) => playerMap.get(id))
    .filter(Boolean)
    .map((player) => prepareSpectator(player));

  const nextHands = Object.fromEntries(
    Object.entries(state.hands ?? {}).filter(([playerId]) => !kickedSet.has(playerId)),
  );

  return {
    ...state,
    players: nextPlayers,
    spectators: nextSpectators,
    roomSettings: {
      ...state.roomSettings,
      maxPlayers: seatLimit,
    },
    scores: ensureScores({ ...state, players: nextPlayers }),
    currentTurn: null,
    banner: 'Waiting for players to ready up…',
    hands: nextHands,
  };
};
