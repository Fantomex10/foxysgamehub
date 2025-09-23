import { DEFAULT_SETTINGS, makeId, makeRoomCode } from '../utils.js';

export const handleCreateRoom = (state, action) => {
  if (!state.userName.trim()) {
    return state;
  }

  const payloadSettings = action?.payload?.settings ?? {};
  const config = {
    ...DEFAULT_SETTINGS,
    ...payloadSettings,
    rules: { ...DEFAULT_SETTINGS.rules, ...(payloadSettings.rules ?? {}) },
  };

  const providedRoomId = action?.payload?.roomId;
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
};
