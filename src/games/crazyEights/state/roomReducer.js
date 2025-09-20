import { createDeck, shuffle, SUITS } from '../../../lib/cards.js';

const HISTORY_LIMIT = 8;
const HAND_SIZE = 5;

const DEFAULT_SETTINGS = {
  maxPlayers: 8,
  initialBots: 0,
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

const clampSeatLimit = (count) => {
  const minSeats = 2;
  const maxSeats = DEFAULT_SETTINGS.maxPlayers;
  const safeCount = Number.isFinite(count) ? Math.floor(count) : maxSeats;
  return Math.min(Math.max(safeCount, minSeats), maxSeats);
};

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

const createBaseState = () => ({
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

const pushHistory = (history, message) => [message, ...history].slice(0, HISTORY_LIMIT);

const getNextPlayerId = (players, currentId) => {
  if (!players.length) return null;
  const currentIndex = players.findIndex((player) => player.id === currentId);
  if (currentIndex === -1) {
    return players[0].id;
  }
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex].id;
};

const dealHandsForPlayers = (players, handSize = HAND_SIZE) => {
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

const recycleDrawPileIfNeeded = (drawPile, discardPile) => {
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

const findPlayer = (players, playerId) => players.find((player) => player.id === playerId);

const isCardPlayable = (card, topCard, activeSuit) => {
  if (card.rank === '8') return true;
  const requiredSuit = activeSuit ?? topCard?.suit ?? null;
  if (requiredSuit && card.suit === requiredSuit) return true;
  if (topCard && card.rank === topCard.rank) return true;
  return false;
};

const normaliseSuit = (candidate) => {
  if (!candidate) return null;
  const lower = candidate.toLowerCase();
  return SUITS.includes(lower) ? lower : null;
};

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
        banner: 'Waiting for players to ready up…',
        botCounter,
        roomSettings: config,
      };
    }

    case 'TOGGLE_READY': {
      const { playerId } = action.payload;
      const updatedPlayers = state.players.map((player) => {
        if (player.id !== playerId) return player;
        const currentStatus = normaliseStatus(player);
        const nextStatus = getNextStatus(currentStatus);
        return {
          ...player,
          status: nextStatus,
          isReady: nextStatus === 'ready',
        };
      });
      return {
        ...state,
        players: updatedPlayers,
      };
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
      return {
        ...state,
        players,
      };
    }


    case 'SET_SEAT_LAYOUT': {
      if (state.phase !== 'roomLobby') {
        return state;
      }
      const requestedSeats = action.payload?.maxSeats;
      const seatLimit = clampSeatLimit(requestedSeats);
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
        currentTurn: null,
        banner: 'Waiting for players to ready up…',
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
      const maxPlayers = state.roomSettings?.maxPlayers ?? Infinity;
      if (state.players.length >= maxPlayers) {
        return {
          ...state,
          banner: `Max players (${maxPlayers}) reached.`,
        };
      }
      const botId = makeId('bot');
      const botNumber = state.botCounter;
      const botPlayer = {
        id: botId,
        name: `Bot ${botNumber}`,
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
      if (state.phase !== 'roomLobby') return state;
      const readyToStart = state.players.length >= 2 && state.players.every((player) => player.isReady) && state.players.length <= (state.roomSettings?.maxPlayers ?? state.players.length);
      if (!readyToStart) {
        return {
          ...state,
          banner: 'Need at least two ready players to begin.',
        };
      }

      const { hands, drawPile, discardPile } = dealHandsForPlayers(state.players, HAND_SIZE);
      const firstPlayer = state.players[0];
      const startingSuit = discardPile.length ? discardPile[discardPile.length - 1].suit : null;
      const history = pushHistory([], `Game started. ${firstPlayer.name} goes first.`);

      return {
        ...state,
        phase: 'playing',
        hands,
        drawPile,
        discardPile,
        currentTurn: firstPlayer.id,
        activeSuit: startingSuit,
        history,
        banner: `${firstPlayer.name}'s turn`,
        players: state.players.map((player) => ({ ...player, isReady: false, status: 'notReady' })),
      };
    }

    case 'PLAY_CARD': {
      if (state.phase !== 'playing') return state;
      const { playerId, card, chosenSuit } = action.payload;
      if (state.currentTurn !== playerId) return state;

      const playerHand = state.hands[playerId] ?? [];
      const cardIndex = playerHand.findIndex((handCard) => handCard.id === card.id);
      if (cardIndex === -1) return state;

      const topCard = state.discardPile[state.discardPile.length - 1] ?? null;
      if (!isCardPlayable(card, topCard, state.activeSuit)) {
        return {
          ...state,
          banner: 'Invalid card. Match suit or rank.',
        };
      }

      const updatedHand = [...playerHand];
      updatedHand.splice(cardIndex, 1);
      let hands = { ...state.hands, [playerId]: updatedHand };
      let discardPile = [...state.discardPile, card];
      let drawPile = [...state.drawPile];
      let history = pushHistory(state.history, `${findPlayer(state.players, playerId)?.name ?? 'Player'} played ${card.rank} of ${card.suit}.`);
      let phase = state.phase;
      let banner = state.banner;
      let activeSuit = state.activeSuit;

      if (card.rank === '8') {
        const declaredSuit = normaliseSuit(chosenSuit) ?? card.suit;
        activeSuit = declaredSuit;
        history = pushHistory(history, `Suit declared to ${declaredSuit.toUpperCase()}.`);
      } else {
        activeSuit = card.suit;
      }

      let nextTurn = getNextPlayerId(state.players, playerId);

      if (updatedHand.length === 0) {
        phase = 'finished';
        nextTurn = null;
        banner = `${findPlayer(state.players, playerId)?.name ?? 'Player'} wins!`;
        history = pushHistory(history, `${findPlayer(state.players, playerId)?.name ?? 'A player'} won the round.`);
        return {
          ...state,
          hands,
          drawPile,
          discardPile,
          currentTurn: nextTurn,
          activeSuit,
          history,
          banner,
          phase,
        };
      }

      if (card.rank === '2' && nextTurn) {
        const penaltyPlayerId = nextTurn;
        let workingDiscard = discardPile;
        const recycle = recycleDrawPileIfNeeded(drawPile, workingDiscard);
        drawPile = recycle.drawPile;
        workingDiscard = recycle.discardPile;
        if (recycle.reshuffled) {
          history = pushHistory(history, 'Reshuffled discard pile into the deck.');
        }

        let penaltyHand = [...(hands[penaltyPlayerId] ?? state.hands[penaltyPlayerId] ?? [])];
        let cardsDrawn = 0;
        for (let i = 0; i < 2; i += 1) {
          if (drawPile.length === 0) break;
          penaltyHand.push(drawPile.shift());
          cardsDrawn += 1;
        }
        hands = { ...hands, [penaltyPlayerId]: penaltyHand };
        const penaltyPlayer = findPlayer(state.players, penaltyPlayerId);
        if (cardsDrawn > 0) {
          history = pushHistory(history, `${penaltyPlayer?.name ?? 'Player'} drew ${cardsDrawn} cards from penalty.`);
        } else {
          history = pushHistory(history, `${penaltyPlayer?.name ?? 'Player'} could not draw penalty cards.`);
        }

        discardPile = workingDiscard;
        nextTurn = getNextPlayerId(state.players, penaltyPlayerId);
      }

      const nextPlayer = findPlayer(state.players, nextTurn);
      banner = `${nextPlayer?.name ?? 'Next player'}'s turn`;

      return {
        ...state,
        hands,
        drawPile,
        discardPile,
        currentTurn: nextTurn,
        activeSuit,
        history,
        banner,
        phase,
      };
    }

    case 'DRAW_CARD': {
      if (state.phase !== 'playing') return state;
      const { playerId } = action.payload;
      if (state.currentTurn !== playerId) return state;

      let drawPile = [...state.drawPile];
      let discardPile = [...state.discardPile];
      let history = state.history;

      const recycleResult = recycleDrawPileIfNeeded(drawPile, discardPile);
      drawPile = recycleResult.drawPile;
      discardPile = recycleResult.discardPile;
      if (recycleResult.reshuffled) {
        history = pushHistory(history, 'Reshuffled discard pile into the deck.');
      }

      if (drawPile.length === 0) {
        return {
          ...state,
          history: pushHistory(history, 'No cards left to draw.'),
          banner: 'Deck empty. Cannot draw.',
        };
      }

      const drawnCard = drawPile.shift();
      const playerHand = [...(state.hands[playerId] ?? [])];
      playerHand.push(drawnCard);
      const updatedHands = { ...state.hands, [playerId]: playerHand };
      const player = findPlayer(state.players, playerId);

      history = pushHistory(history, `${player?.name ?? 'Player'} drew a card.`);

      const currentTurn = getNextPlayerId(state.players, playerId);
      const nextPlayer = findPlayer(state.players, currentTurn);
      const banner = `${nextPlayer?.name ?? 'Next player'}'s turn`;

      return {
        ...state,
        hands: updatedHands,
        drawPile,
        discardPile,
        currentTurn,
        activeSuit: state.activeSuit,
        history,
        banner,
      };
    }

    case 'RETURN_TO_LOBBY': {
      if (state.phase === 'idle') return state;
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
        players: state.players.map((player) => prepareSeatedPlayer(player)),
        spectators: (state.spectators ?? []).map((spectator) => prepareSpectator(spectator)),
      };
    }

    case 'RESET_SESSION': {
      const next = createInitialState({ userId: state.userId, userName: state.userName });
      return { ...next, players: [], spectators: [] };
    }

    default:
      return state;
  }
};
