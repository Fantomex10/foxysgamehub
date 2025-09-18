import { createDeck, shuffle } from '../lib/cards.js';

const HISTORY_LIMIT = 8;
const HAND_SIZE = 5;
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

const makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
const makeRoomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();

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
  const deck = shuffle(createDeck());
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

export const initialRoomState = {
  userId: makeId('player'),
  userName: '',
  phase: 'welcome', // welcome | lobby | playing | finished
  roomId: null,
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
      const roomId = makeRoomCode();
      const hostPlayer = {
        id: state.userId,
        name: state.userName.trim(),
        isHost: true,
        isBot: false,
        isReady: false,
      };
      return {
        ...state,
        phase: 'lobby',
        roomId,
        hostId: state.userId,
        players: [hostPlayer],
        hands: {},
        drawPile: [],
        discardPile: [],
        currentTurn: null,
        activeSuit: null,
        history: [],
        banner: 'Waiting for players to ready up…',
        botCounter: 1,
      };
    }

    case 'TOGGLE_READY': {
      const { playerId } = action.payload;
      const updatedPlayers = state.players.map((player) =>
        player.id === playerId ? { ...player, isReady: !player.isReady } : player,
      );
      return {
        ...state,
        players: updatedPlayers,
      };
    }

    case 'AUTO_READY_BOTS': {
      if (state.phase !== 'lobby') return state;
      const players = state.players.map((player) =>
        player.isBot ? { ...player, isReady: true } : player,
      );
      return { ...state, players };
    }

    case 'ADD_BOT': {
      if (state.phase !== 'lobby' || state.hostId !== state.userId) {
        return state;
      }
      const botId = makeId('bot');
      const botNumber = state.botCounter;
      const botPlayer = {
        id: botId,
        name: `Bot ${botNumber}`,
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
      if (state.phase !== 'lobby' || state.hostId !== state.userId) {
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
      if (state.phase !== 'lobby') return state;
      const readyToStart = state.players.length >= 2 && state.players.every((player) => player.isReady);
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
        players: state.players.map((player) => ({ ...player, isReady: false })),
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
      if (state.phase === 'welcome') return state;
      return {
        ...state,
        phase: 'lobby',
        hands: {},
        drawPile: [],
        discardPile: [],
        currentTurn: null,
        activeSuit: null,
        history: [],
        banner: 'Waiting for players to ready up…',
        players: state.players.map((player) => ({ ...player, isReady: false })),
      };
    }

    case 'RESET_SESSION': {
      return {
        ...initialRoomState,
        userId: state.userId,
        userName: state.userName,
        players: [],
      };
    }

    default:
      return state;
  }
};
