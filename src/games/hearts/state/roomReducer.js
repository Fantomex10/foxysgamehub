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

const STATUS_SEQUENCE = ['notReady', 'ready', 'needsTime'];

const getNextStatus = (current) => {
  const index = STATUS_SEQUENCE.indexOf(current);
  const safeIndex = index === -1 ? 0 : index;
  return STATUS_SEQUENCE[(safeIndex + 1) % STATUS_SEQUENCE.length];
};

const normaliseStatus = (player) => {
  if (player.status && STATUS_SEQUENCE.includes(player.status)) {
    return player.status;
  }
  return player.isReady ? 'ready' : 'notReady';
};

const clampSeatLimit = () => REQUIRED_PLAYERS;

const prepareSeatedPlayer = (player) => ({
  ...player,
  isSpectator: false,
  isReady: false,
  status: 'notReady',
});

const prepareSpectator = (player) => ({
  ...player,
  isSpectator: true,
  isReady: false,
  status: 'notReady',
});

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
      const providedRoomId = action.payload?.roomId;
      const normalisedRoomId = typeof providedRoomId === 'string' && providedRoomId.trim().length > 0
        ? providedRoomId.trim().toUpperCase()
        : null;
      const roomId = normalisedRoomId ?? makeRoomCode();
      const hostPlayer = {
        id: state.userId,
        name: state.userName.trim(),
        isHost: true,
        isBot: false,
        isReady: false,
        status: 'notReady',
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
          status: 'notReady',
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
        spectators: [],
        hands: {},
        drawPile: [],
        discardPile: [],
        currentTurn: null,
        activeSuit: null,
        history: [],
        banner: 'Waiting for players to ready up...',
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
      const players = state.players.map((player) => {
        if (player.id !== playerId) return player;
        const currentStatus = normaliseStatus(player);
        const nextStatus = getNextStatus(currentStatus);
        return {
          ...player,
          status: nextStatus,
          isReady: nextStatus === 'ready',
        };
      });
      return { ...state, players };
    }

    case 'SET_PLAYER_STATUS': {
      const { playerId, status } = action.payload;
      if (!STATUS_SEQUENCE.includes(status)) {
        return state;
      }
      const players = state.players.map((player) => {
        if (player.id !== playerId) return player;
        return {
          ...player,
          status,
          isReady: status === 'ready',
        };
      });
      return { ...state, players };
    }


    case 'SET_SEAT_LAYOUT': {
      if (state.phase !== 'roomLobby') {
        return state;
      }
      const seatLimit = clampSeatLimit();
      const kickedIds = Array.isArray(action.payload?.kickedIds)
        ? action.payload.kickedIds.filter((id) => typeof id === 'string')
        : [];
      const kickedSet = new Set(kickedIds);
      if (state.hostId) {
        kickedSet.delete(state.hostId);
      }
      const seatOrder = Array.isArray(action.payload?.seatOrder)
        ? action.payload.seatOrder.filter((id) => !kickedSet.has(id))
        : [];
      const benchOrder = Array.isArray(action.payload?.benchOrder)
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
        banner: 'Waiting for players to ready up...',
        hands: nextHands,
      };
    }

    case 'AUTO_READY_BOTS': {
      if (state.phase !== 'roomLobby') return state;
      const players = state.players.map((player) =>
        player.isBot ? { ...player, isReady: true, status: 'ready' } : player,
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
        status: 'notReady',
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
      if (lastBotIndex !== -1) {
        const indexToRemove = state.players.length - 1 - lastBotIndex;
        return {
          ...state,
          players: state.players.filter((_, index) => index !== indexToRemove),
        };
      }
      const spectators = state.spectators ?? [];
      const lastBenchBotIndex = [...spectators].reverse().findIndex((player) => player.isBot);
      if (lastBenchBotIndex === -1) return state;
      const benchIndexToRemove = spectators.length - 1 - lastBenchBotIndex;
      return {
        ...state,
        spectators: spectators.filter((_, index) => index !== benchIndexToRemove),
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
        ? state.players.map((player) => ({ ...player, isReady: false, status: 'notReady' }))
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
      const discardSnapshot = trick;
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
            discardPile: [],
            lastTrick: [],
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
          discardPile: [],
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
        discardPile: discardSnapshot,
        lastTrick: [],
      };
    }

    case 'DRAW_CARD':
      return state;

    case 'RETURN_TO_LOBBY': {
      if (state.phase === 'idle') return state;
      const players = state.players.map((player) => prepareSeatedPlayer(player));
      const spectators = (state.spectators ?? []).map((spectator) => prepareSpectator(spectator));
      return {
        ...state,
        phase: 'roomLobby',
        hands: {},
        drawPile: [],
        discardPile: [],
        currentTurn: null,
        activeSuit: null,
        history: [],
        banner: 'Waiting for players to ready up...',
        players,
        spectators,
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
      const base = createInitialState({ userId: state.userId, userName: state.userName });
      const preservedSettings = state.roomSettings
        ? { ...base.roomSettings, ...state.roomSettings }
        : base.roomSettings;
      const trimmedName = base.userName?.trim() ?? '';
      const roomId = state.roomId ?? makeRoomCode();
      const roomName = preservedSettings.roomName?.trim() || state.roomName || `Room ${roomId}`;
      const desiredHostId = state.hostId ?? base.userId;

      let players = (state.players ?? []).map((player) => prepareSeatedPlayer({
        ...player,
        isHost: player.id === desiredHostId,
      }));

      if (!players.length && trimmedName) {
        players = [
          prepareSeatedPlayer({
            id: base.userId,
            name: trimmedName,
            isHost: true,
            isBot: false,
          }),
        ];
      } else if (players.length && !players.some((player) => player.id === desiredHostId) && trimmedName) {
        players = [
          prepareSeatedPlayer({
            id: base.userId,
            name: trimmedName,
            isHost: true,
            isBot: false,
          }),
          ...players,
        ];
      }

      const spectators = (state.spectators ?? []).map((spectator) => prepareSpectator(spectator));
      const hostId = players.length ? players.find((player) => player.isHost)?.id ?? players[0].id : null;

      return {
        ...base,
        phase: players.length ? 'roomLobby' : base.phase,
        roomId,
        roomName: players.length ? roomName : base.roomName,
        hostId,
        players,
        spectators,
        roomSettings: {
          ...preservedSettings,
          roomName,
        },
        botCounter: state.botCounter ?? base.botCounter,
        banner: players.length ? 'Waiting for players to ready up...' : base.banner,
        hands: {},
        drawPile: [],
        discardPile: [],
        currentTurn: null,
        activeSuit: null,
        history: [],
        trick: [],
        trickCaptures: {},
        leadSuit: null,
        heartsBroken: false,
        trickCount: 0,
        roundScores: {},
        scores: {},
        roundNumber: 0,
        gameOver: false,
        lastTrick: [],
      };
    }

    default:
      return state;
  }
};


