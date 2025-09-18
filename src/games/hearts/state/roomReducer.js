import { createDeck, shuffle, SUITS } from '../../../lib/cards.js';
import {
  calculateTrickWinner,
  countTrickPoints,
  detectShootTheMoon,
  getLegalMoves,
  sortHandForDisplay,
} from '../utils.js';

const HISTORY_LIMIT = 12;
const HAND_SIZE = 13;
const REQUIRED_PLAYERS = 4;

const DEFAULT_SETTINGS = {
  maxPlayers: REQUIRED_PLAYERS,
  initialBots: 3,
  rules: {},
  roomName: '',
};

const makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
const makeRoomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();

const pushHistory = (history, message) => [message, ...history].slice(0, HISTORY_LIMIT);

const dealHands = (players) => {
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

const findTwoOfClubsOwner = (hands) => {
  for (const [playerId, hand] of Object.entries(hands)) {
    if (hand.some((card) => card.rank === '2' && card.suit === 'clubs')) {
      return playerId;
    }
  }
  return null;
};

const createBaseState = () => ({
  userId: makeId('player'),
  userName: '',
  phase: 'idle',
  roomId: null,
  roomName: null,
  hostId: null,
  players: [],
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

export const createInitialState = ({ userId, userName } = {}) => {
  const base = createBaseState();
  if (userId) {
    base.userId = userId;
  }
  if (typeof userName === 'string') {
    base.userName = userName;
  }
  return base;
};

const findPlayer = (players, playerId) => players.find((player) => player.id === playerId);

const validateReadyToStart = (state) => {
  if (state.players.length !== REQUIRED_PLAYERS) {
    return false;
  }
  return state.players.every((player) => player.isReady);
};

const cloneCaptures = (captures) => {
  const next = {};
  for (const [playerId, cards] of Object.entries(captures ?? {})) {
    next[playerId] = [...cards];
  }
  return next;
};

const appendCapture = (captures, playerId, cards) => {
  const next = cloneCaptures(captures);
  if (!next[playerId]) {
    next[playerId] = [];
  }
  next[playerId].push(...cards);
  return next;
};

const ensureScores = (state) => {
  const scores = { ...state.scores };
  for (const player of state.players) {
    if (typeof scores[player.id] !== 'number') {
      scores[player.id] = 0;
    }
  }
  return scores;
};

export const roomReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NAME': {
      return { ...state, userName: action.payload?.trim() ?? '' };
    }

    case 'CREATE_ROOM': {
      if (!state.userName.trim()) {
        return state;
      }
      const payloadSettings = action.payload?.settings ?? {};
      const config = {
        ...DEFAULT_SETTINGS,
        ...payloadSettings,
        maxPlayers: REQUIRED_PLAYERS,
        initialBots: Math.min(payloadSettings.initialBots ?? DEFAULT_SETTINGS.initialBots, REQUIRED_PLAYERS - 1),
        rules: { ...DEFAULT_SETTINGS.rules, ...(payloadSettings.rules ?? {}) },
      };

      const roomId = makeRoomCode();
      const hostPlayer = {
        id: state.userId,
        name: state.userName.trim(),
        isHost: true,
        isBot: false,
        isReady: false,
      };

      const players = [hostPlayer];
      let botCounter = 1;
      for (let i = 0; i < config.initialBots; i += 1) {
        const botPlayer = {
          id: makeId('bot'),
          name: `Bot ${botCounter}`,
          isBot: true,
          isHost: false,
          isReady: false,
        };
        players.push(botPlayer);
        botCounter += 1;
      }

      const scores = {};
      for (const player of players) {
        scores[player.id] = 0;
      }

      return {
        ...state,
        phase: 'roomLobby',
        roomId,
        roomName: config.roomName || `Room ${roomId}`,
        hostId: state.userId,
        players,
        hands: {},
        drawPile: [],
        discardPile: [],
        currentTurn: null,
        activeSuit: null,
        history: [],
        banner: 'Waiting for players to ready up…',
        botCounter,
        roomSettings: config,
        scores,
        roundScores: {},
        trick: [],
        trickCaptures: {},
        heartsBroken: false,
        trickCount: 0,
        roundNumber: 0,
        gameOver: false,
        lastTrick: [],
      };
    }

    case 'TOGGLE_READY': {
      const { playerId } = action.payload;
      const updatedPlayers = state.players.map((player) =>
        player.id === playerId ? { ...player, isReady: !player.isReady } : player,
      );
      return { ...state, players: updatedPlayers };
    }

    case 'AUTO_READY_BOTS': {
      if (state.phase !== 'roomLobby') return state;
      const players = state.players.map((player) =>
        player.isBot ? { ...player, isReady: true } : player,
      );
      return { ...state, players };
    }

    case 'ADD_BOT': {
      if (state.phase !== 'roomLobby' || state.hostId !== state.userId) {
        return state;
      }
      if (state.players.length >= REQUIRED_PLAYERS) {
        return { ...state, banner: 'Hearts requires exactly four players.' };
      }
      const botPlayer = {
        id: makeId('bot'),
        name: `Bot ${state.botCounter}`,
        isBot: true,
        isHost: false,
        isReady: false,
      };
      return {
        ...state,
        players: [...state.players, botPlayer],
        botCounter: state.botCounter + 1,
      };
    }

    case 'REMOVE_BOT': {
      if (state.phase !== 'roomLobby' || state.hostId !== state.userId) {
        return state;
      }
      const lastBotIndex = [...state.players].reverse().findIndex((player) => player.isBot);
      if (lastBotIndex === -1) return state;
      const indexToRemove = state.players.length - 1 - lastBotIndex;
      return {
        ...state,
        players: state.players.filter((_, index) => index !== indexToRemove),
      };
    }

    case 'START_GAME': {
      const startingFromFinished = state.phase === 'finished';
      const startingFromLobby = state.phase === 'roomLobby';
      if (!startingFromFinished && !startingFromLobby) return state;

      if (startingFromLobby && !validateReadyToStart(state)) {
        return {
          ...state,
          banner: 'Need four ready players to begin Hearts.',
        };
      }

      if (startingFromFinished && state.gameOver) {
        return {
          ...state,
          banner: 'Match complete. Return to the lobby to start a new game.',
        };
      }

      const players = startingFromLobby
        ? state.players.map((player) => ({ ...player, isReady: false }))
        : state.players;

      const hands = dealHands(players);
      const starter = findTwoOfClubsOwner(hands) ?? players[0].id;
      const trickCaptures = players.reduce((acc, player) => ({ ...acc, [player.id]: [] }), {});
      const roundScores = players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {});

      return {
        ...state,
        phase: 'playing',
        players,
        hands,
        currentTurn: starter,
        history: pushHistory([], `${findPlayer(players, starter)?.name ?? 'Player'} leads the first trick.`),
        banner: `${findPlayer(players, starter)?.name ?? 'Player'} to lead.`,
        trick: [],
        leadSuit: null,
        heartsBroken: false,
        trickCaptures,
        trickCount: 0,
        roundNumber: state.roundNumber + 1,
        roundScores,
        gameOver: false,
      };
    }

    case 'PLAY_CARD': {
      if (state.phase !== 'playing') return state;
      const { playerId, card } = action.payload;
      if (state.currentTurn !== playerId) return state;

      const playerHand = [...(state.hands[playerId] ?? [])];
      const cardIndex = playerHand.findIndex((handCard) => handCard.id === card.id);
      if (cardIndex === -1) return state;

      const legalMoves = getLegalMoves(state, playerId);
      if (!legalMoves.some((legal) => legal.id === card.id)) {
        return {
          ...state,
          banner: 'Illegal card for this trick.',
        };
      }

      playerHand.splice(cardIndex, 1);
      const hands = { ...state.hands, [playerId]: playerHand };

      const trick = [...state.trick, { playerId, card }];
      let lastTrick = [];
      const leadSuit = state.leadSuit ?? card.suit;
      const heartsBroken = state.heartsBroken || card.suit === 'hearts';
      let history = pushHistory(state.history, `${findPlayer(state.players, playerId)?.name ?? 'Player'} played ${card.rank} of ${card.suit}.`);

      let banner = state.banner;
      let phase = state.phase;
      let currentTurn = state.currentTurn;
      let trickCaptures = state.trickCaptures;
      let trickCount = state.trickCount;
      let scores = state.scores;
      let roundScores = state.roundScores;

      if (trick.length === REQUIRED_PLAYERS) {
        const winnerId = calculateTrickWinner(leadSuit, trick) ?? playerId;
        const trickCards = trick.map((entry) => entry.card);
        const trickPoints = countTrickPoints(trickCards);

        trickCaptures = appendCapture(trickCaptures, winnerId, trickCards);
        lastTrick = trick;
        roundScores = {
          ...roundScores,
          [winnerId]: (roundScores[winnerId] ?? 0) + trickPoints,
        };
        history = pushHistory(history, `${findPlayer(state.players, winnerId)?.name ?? 'Player'} captured the trick (${trickPoints} pts).`);

        const handsRemaining = Object.values(hands).reduce((sum, handCards) => sum + handCards.length, 0);

        currentTurn = winnerId;
        trickCount += 1;

        if (handsRemaining === 0) {
          const shootMoonPlayer = detectShootTheMoon(trickCaptures);
          const baseScores = ensureScores({ ...state, players: state.players, scores: state.scores });
          const updatedScores = { ...baseScores };

          if (shootMoonPlayer) {
            for (const player of state.players) {
              if (player.id === shootMoonPlayer) continue;
              updatedScores[player.id] += 26;
            }
            history = pushHistory(history, `${findPlayer(state.players, shootMoonPlayer)?.name ?? 'Player'} shot the moon!`);
          } else {
            for (const player of state.players) {
              updatedScores[player.id] += roundScores[player.id] ?? 0;
            }
          }

          scores = updatedScores;

          const maxScore = Math.max(...Object.values(updatedScores));
          const gameOver = maxScore >= 100;

          if (gameOver) {
            const minScore = Math.min(...Object.values(updatedScores));
            const winners = state.players
              .filter((player) => updatedScores[player.id] === minScore)
              .map((player) => player.name)
              .join(', ');

            banner = `Game over. ${winners} win${winners.includes(',') ? '' : 's'}!`;
            phase = 'finished';
            currentTurn = null;
          } else {
            banner = 'Round complete. Host can start a new round.';
            phase = 'finished';
            currentTurn = null;
          }

          return {
            ...state,
            hands,
            trick: [],
            leadSuit: null,
            heartsBroken,
            history,
            banner,
            phase,
            currentTurn,
            trickCaptures,
            trickCount,
            scores,
            roundScores,
            gameOver,
            lastTrick,
          };
        }

        banner = `${findPlayer(state.players, winnerId)?.name ?? 'Player'} leads the next trick.`;

        return {
          ...state,
          hands,
          trick: [],
          leadSuit: null,
          heartsBroken,
          history,
          banner,
          currentTurn,
          trickCaptures,
          trickCount,
          roundScores,
          lastTrick,
        };
      }

      const nextPlayerIndex = (state.players.findIndex((p) => p.id === playerId) + 1) % state.players.length;
      currentTurn = state.players[nextPlayerIndex].id;
      banner = `${findPlayer(state.players, currentTurn)?.name ?? 'Player'} to play.`;

      return {
        ...state,
        hands,
        trick,
        leadSuit,
        heartsBroken,
        history,
        banner,
        currentTurn,
        lastTrick: [],
      };
    }

    case 'DRAW_CARD':
      return state;

    case 'RETURN_TO_LOBBY': {
      if (state.phase === 'idle') return state;
      const players = state.players.map((player) => ({ ...player, isReady: false }));
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
        players,
        trick: [],
        trickCaptures: {},
        heartsBroken: false,
        trickCount: 0,
        roundScores: {},
        gameOver: false,
        lastTrick: [],
      };
    }

    case 'RESET_SESSION': {
      return {
        ...createInitialState({ userId: state.userId, userName: state.userName }),
        players: [],
      };
    }

    default:
      return state;
  }
};
