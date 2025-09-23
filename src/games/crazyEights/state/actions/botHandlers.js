import { HISTORY_LIMIT } from '../utils.js';
import { createBotHandlers } from '../../../shared/botHandlers.js';

const {
  addBot: handleAddBot,
  removeBot: handleRemoveBot,
  autoReadyBots: handleAutoReadyBots,
} = createBotHandlers({
  getSeatLimit: (state) => state.roomSettings?.maxPlayers ?? Infinity,
  bannerWhenFull: (limit) => `Max players (${limit}) reached.`,
  historyLimit: HISTORY_LIMIT,
  messages: {
    lobbyOnly: null,
    hostOnly: null,
    lobbyFull: null,
    autoReady: null,
  },
});

export { handleAddBot, handleRemoveBot, handleAutoReadyBots };
