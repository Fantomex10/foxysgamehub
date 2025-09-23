import { createDeck, shuffle, SUITS } from '../../../lib/cards.js';
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

export const HISTORY_LIMIT = 8;
export const HAND_SIZE = 5;

export const DEFAULT_SETTINGS = {
  maxPlayers: 8,
  initialBots: 0,
  rules: {},
  roomName: '',
};

export const clampSeatLimit = (count) => {
  const minSeats = 2;
  const maxSeats = DEFAULT_SETTINGS.maxPlayers;
  const safeCount = Number.isFinite(count) ? Math.floor(count) : maxSeats;
  return Math.min(Math.max(safeCount, minSeats), maxSeats);
};

export const createBaseState = () => ({
  userId: makeId('player'),
  userName: '',
  phase: 'idle', // idle | roomLobby | playing | finished
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
});

export const pushHistory = createHistoryPusher(HISTORY_LIMIT);

export const getNextPlayerId = (players, currentId) => {
  if (!players.length) return null;
  const currentIndex = players.findIndex((player) => player.id === currentId);
  if (currentIndex === -1) {
    return players[0].id;
  }
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex].id;
};

export const dealHandsForPlayers = (players, handSize = HAND_SIZE) => {
  const deckCount = players.length >= 5 ? 2 : 1;
  const deck = shuffle(createDeck(deckCount));
  const hands = {};
  let cursor = 0;

  for (let i = 0; i < handSize; i += 1) {
    for (const player of players) {
      const card = deck[cursor];
      cursor += 1;
      if (!card) break;
      if (!hands[player.id]) hands[player.id] = [];
      hands[player.id].push(card);
    }
  }

  const discardPile = [deck[cursor]];
  cursor += 1;
  const drawPile = deck.slice(cursor);

  return { hands, drawPile, discardPile: discardPile.filter(Boolean) };
};

export const recycleDrawPileIfNeeded = (drawPile, discardPile) => {
  if (drawPile.length > 0 || discardPile.length <= 1) {
    return { drawPile, discardPile, reshuffled: false };
  }

  const topCard = discardPile[discardPile.length - 1];
  const recyclable = discardPile.slice(0, -1);
  const recycledDraw = shuffle(recyclable);
  return {
    drawPile: recycledDraw,
    discardPile: [topCard],
    reshuffled: true,
  };
};

export const isCardPlayable = (card, topCard, activeSuit) => {
  if (card.rank === '8') return true;
  const requiredSuit = activeSuit ?? topCard?.suit ?? null;
  if (requiredSuit && card.suit === requiredSuit) return true;
  if (topCard && card.rank === topCard.rank) return true;
  return false;
};

export const normaliseSuit = (candidate) => {
  if (!candidate) return null;
  const lower = candidate.toLowerCase();
  return SUITS.includes(lower) ? lower : null;
};

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
