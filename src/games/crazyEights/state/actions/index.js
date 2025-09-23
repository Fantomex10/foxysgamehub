import { handleSetName } from './setName.js';
import { handleCreateRoom } from './createRoom.js';
import { handleToggleReady } from './toggleReady.js';
import { handleSetPlayerStatus } from './setPlayerStatus.js';
import { handleSetSeatLayout } from './setSeatLayout.js';
import { handleAutoReadyBots } from './autoReadyBots.js';
import { handleAddBot } from './addBot.js';
import { handleRemoveBot } from './removeBot.js';
import { handleStartGame } from './startGame.js';
import { handlePlayCard } from './playCard.js';
import { handleDrawCard } from './drawCard.js';
import { handleReturnToLobby } from './returnToLobby.js';
import { handleResetSession } from './resetSession.js';

export const actionHandlers = {
  SET_NAME: handleSetName,
  CREATE_ROOM: handleCreateRoom,
  TOGGLE_READY: handleToggleReady,
  SET_PLAYER_STATUS: handleSetPlayerStatus,
  SET_SEAT_LAYOUT: handleSetSeatLayout,
  AUTO_READY_BOTS: handleAutoReadyBots,
  ADD_BOT: handleAddBot,
  REMOVE_BOT: handleRemoveBot,
  START_GAME: handleStartGame,
  PLAY_CARD: handlePlayCard,
  DRAW_CARD: handleDrawCard,
  RETURN_TO_LOBBY: handleReturnToLobby,
  RESET_SESSION: handleResetSession,
};
