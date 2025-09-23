import { HISTORY_LIMIT, REQUIRED_PLAYERS } from '../utils.js';
import { createBotHandlers } from '../../../shared/botHandlers.js';

const {
  addBot: handleAddBot,
  removeBot: handleRemoveBot,
  autoReadyBots: handleAutoReadyBots,
} = createBotHandlers({
  getSeatLimit: () => REQUIRED_PLAYERS,
  bannerWhenFull: 'Hearts requires exactly four players.',
  historyLimit: HISTORY_LIMIT,
  messages: {
    lobbyOnly: null,
    hostOnly: null,
    lobbyFull: null,
    autoReady: null,
  },
});

export { handleAddBot, handleRemoveBot, handleAutoReadyBots };
