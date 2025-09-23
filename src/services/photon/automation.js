const shouldAutoReadyBots = (state) => {
  if (!state || state.phase !== 'roomLobby') {
    return false;
  }
  const players = Array.isArray(state.players) ? state.players : [];
  const humans = players.filter((player) => !player.isBot);
  if (humans.length === 0) {
    return false;
  }
  const humansReady = humans.every((player) => player.isReady);
  const botsNeedReady = players.some((player) => player.isBot && !player.isReady);
  return humansReady && botsNeedReady;
};

const resolveBotTurnPlayer = (state) => {
  if (!state || state.phase !== 'playing') {
    return null;
  }
  const players = Array.isArray(state.players) ? state.players : [];
  return players.find((player) => player.id === state.currentTurn && player.isBot) ?? null;
};

const getBotThinkDelay = (engine) => {
  const delay = engine?.botThinkDelay;
  return typeof delay === 'number' && delay >= 0 ? delay : 0;
};

const selectBotAction = (engine, state, player) => {
  if (!engine || typeof engine.getBotAction !== 'function' || !player) {
    return null;
  }
  return engine.getBotAction(state, player) ?? null;
};

export {
  getBotThinkDelay,
  resolveBotTurnPlayer,
  selectBotAction,
  shouldAutoReadyBots,
};
