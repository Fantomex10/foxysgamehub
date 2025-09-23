import { createDeck, shuffle, SUITS } from '../../../lib/cards.js';
import { sortHandForDisplay } from '../utils.js';
import {
  STATUS_SEQUENCE,
  getNextStatus,
  normaliseStatus,
  prepareSeatedPlayer,
  prepareSpectator,
  makeId,
  makeRoomCode,
  findPlayer,
  createHistoryPusher,
} from '../../shared/lobbyUtils.js';

export const HISTORY_LIMIT = 12;
export const HAND_SIZE = 13;
export const REQUIRED_PLAYERS = 4;

export const DEFAULT_SETTINGS = {
  maxPlayers: REQUIRED_PLAYERS,
  initialBots: 3,
  rules: {},
  roomName: '',
};

export const clampSeatLimit = () => REQUIRED_PLAYERS;

export const pushHistory = createHistoryPusher(HISTORY_LIMIT);

export const dealHands = (players) => {
  const deck = shuffle(createDeck());
  const hands = {};
  let cursor = 0;

  for (let i = 0; i < HAND_SIZE; i += 1) {
    for (const player of players) {
      const card = deck[cursor];
      cursor += 1;
      if (!card) break;
      if (!hands[player.id]) hands[player.id] = [];
      hands[player.id].push(card);
    }
  }

  for (const playerId of Object.keys(hands)) {
    hands[playerId] = sortHandForDisplay(hands[playerId]);
  }

  return hands;
};

export const findTwoOfClubsOwner = (hands) => {
  for (const [playerId, hand] of Object.entries(hands)) {
    if (hand.some((card) => card.rank === '2' && card.suit === 'clubs')) {
      return playerId;
    }
  }
  return null;
};

const cloneCaptures = (captures) => {
  const next = {};
  for (const [playerId, cards] of Object.entries(captures ?? {})) {
    next[playerId] = [...cards];
  }
  return next;
};

export const appendCapture = (captures, playerId, cards) => {
  const next = cloneCaptures(captures);
  if (!next[playerId]) {
    next[playerId] = [];
  }
  next[playerId].push(...cards);
  return next;
};

export const ensureScores = (state) => {
  const scores = { ...state.scores };
  for (const player of state.players) {
    if (typeof scores[player.id] !== 'number') {
      scores[player.id] = 0;
    }
  }
  return scores;
};

export const createBaseState = () => ({
  userId: makeId('player'),
  userName: '',
  phase: 'idle',
  roomId: null,
  roomName: null,
  hostId: null,
  players: [],
  spectators: [],
  hands: {},
  drawPile: [],
  discardPile: [],
  currentTurn: null,
  activeSuit: null,
  history: [],
  banner: '',
  botCounter: 1,
  roomSettings: { ...DEFAULT_SETTINGS },
  scores: {},
  roundScores: {},
  trick: [],
  trickCaptures: {},
  leadSuit: null,
  heartsBroken: false,
  trickCount: 0,
  roundNumber: 0,
});

export const validateReadyToStart = (state) => {
  if (state.players.length !== REQUIRED_PLAYERS) {
    return false;
  }
  return state.players.every((player) => player.isReady);
};

export const REQUIRED_SUITS = SUITS;

export {
  STATUS_SEQUENCE,
  getNextStatus,
  normaliseStatus,
  prepareSeatedPlayer,
  prepareSpectator,
  makeId,
  makeRoomCode,
  findPlayer,
};
