import { makeId, createHistoryPusher } from './lobbyUtils.js';

const createHistoryWriter = (limit) => {
  if (typeof limit !== 'number') {
    return (history, message) => {
      const log = Array.isArray(history) ? history : [];
      return message ? [message, ...log] : log;
    };
  }
  const pushHistory = createHistoryPusher(limit);
  return (history, message) => (message ? pushHistory(history, message) : history ?? []);
};

const defaultMessages = {
  lobbyOnly: null,
  hostOnly: null,
  lobbyFull: null,
  autoReady: null,
};

export const createBotHandlers = ({
  getSeatLimit,
  bannerWhenFull,
  messages = {},
  historyLimit,
  namePrefix = 'Bot',
} = {}) => {
  const mergedMessages = { ...defaultMessages, ...messages };
  const writeHistory = createHistoryWriter(historyLimit);

  const resolveSeatLimit = (state) => {
    const limitCandidate = typeof getSeatLimit === 'function'
      ? getSeatLimit(state)
      : getSeatLimit;
    if (typeof limitCandidate !== 'number' || limitCandidate <= 0) {
      return Infinity;
    }
    return Math.floor(limitCandidate);
  };

  const appendHistory = (state, message) => {
    if (!message) {
      return state;
    }
    return {
      ...state,
      history: writeHistory(state.history, message),
    };
  };

  const ensureLobbyAndHost = (state) => {
    if (state.phase !== 'roomLobby') {
      return appendHistory(state, mergedMessages.lobbyOnly);
    }
    if (state.hostId !== state.userId) {
      return appendHistory(state, mergedMessages.hostOnly);
    }
    return null;
  };

  const addBot = (state) => {
    const violation = ensureLobbyAndHost(state);
    if (violation) {
      return violation;
    }

    const seatLimit = resolveSeatLimit(state);
    if (state.players.length >= seatLimit) {
      if (typeof bannerWhenFull === 'function') {
        return {
          ...state,
          banner: bannerWhenFull(seatLimit, state),
        };
      }
      if (typeof bannerWhenFull === 'string') {
        return {
          ...state,
          banner: bannerWhenFull,
        };
      }
      return appendHistory(state, mergedMessages.lobbyFull);
    }

    const botPlayer = {
      id: makeId('bot'),
      name: `${namePrefix} ${state.botCounter}`,
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
  };

  const removeBot = (state) => {
    const violation = ensureLobbyAndHost(state);
    if (violation) {
      return violation;
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
    if (lastBenchBotIndex === -1) {
      return state;
    }

    const benchIndexToRemove = spectators.length - 1 - lastBenchBotIndex;
    return {
      ...state,
      spectators: spectators.filter((_, index) => index !== benchIndexToRemove),
    };
  };

  const autoReadyBots = (state) => {
    if (state.phase !== 'roomLobby') {
      return appendHistory(state, mergedMessages.lobbyOnly);
    }

    const players = state.players.map((player) => (
      player.isBot
        ? { ...player, isReady: true, status: 'ready' }
        : player
    ));

    const updated = {
      ...state,
      players,
    };

    return appendHistory(updated, mergedMessages.autoReady);
  };

  return {
    addBot,
    removeBot,
    autoReadyBots,
  };
};
