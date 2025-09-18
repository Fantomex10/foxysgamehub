const cloneState = (state) => JSON.parse(JSON.stringify(state));

class PhotonClient {
  constructor(engine) {
    this.engine = engine;
    this.state = cloneState(engine.createInitialState());
    this.listeners = new Set();
    this.botTimeout = null;
  }

  setEngine(engine) {
    if (this.engine?.id === engine.id) return;
    this.clearBotTimeout();
    this.engine = engine;
    this.state = cloneState(engine.createInitialState({
      userId: this.state.userId,
      userName: this.state.userName,
    }));
    this.notify();
  }

  getState() {
    return this.state;
  }

  connect({ userId, userName, engineId } = {}) {
    if (engineId && this.engine?.id !== engineId) {
      throw new Error(`PhotonClient engine mismatch: expected ${this.engine?.id}, received ${engineId}`);
    }
    this.state = cloneState(
      this.engine.createInitialState({
        userId,
        userName: userName ?? '',
      }),
    );
    this.notify();
    this.runAutomation();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  disconnect() {
    this.clearBotTimeout();
    this.listeners.clear();
  }

  setDisplayName(name) {
    this.dispatch({ type: 'SET_NAME', payload: name });
  }

  createRoom(options) {
    this.dispatch({ type: 'CREATE_ROOM', payload: { settings: options?.settings } });
  }

  toggleReady(playerId) {
    this.dispatch({ type: 'TOGGLE_READY', payload: { playerId } });
  }

  addBot() {
    this.dispatch({ type: 'ADD_BOT' });
  }

  removeBot() {
    this.dispatch({ type: 'REMOVE_BOT' });
  }

  startGame() {
    this.dispatch({ type: 'START_GAME' });
  }

  playCard(playerId, card, chosenSuit) {
    this.dispatch({ type: 'PLAY_CARD', payload: { playerId, card, chosenSuit } });
  }

  drawCard(playerId) {
    this.dispatch({ type: 'DRAW_CARD', payload: { playerId } });
  }

  returnToLobby() {
    this.dispatch({ type: 'RETURN_TO_LOBBY' });
  }

  exportRoomSnapshot() {
    return cloneState(this.state);
  }

  loadRoom(roomState, currentUser) {
    this.clearBotTimeout();
    const snapshot = cloneState(roomState);
    const userId = currentUser?.userId ?? snapshot.userId;
    const userName = currentUser?.userName ?? snapshot.userName ?? 'Player';
    snapshot.userId = userId;
    snapshot.userName = userName;
    if (!Array.isArray(snapshot.players)) {
      snapshot.players = [];
    }
    const maxPlayers = snapshot.roomSettings?.maxPlayers ?? Infinity;
    const existingIndex = snapshot.players.findIndex((player) => player.id === userId);
    if (existingIndex === -1) {
      if (snapshot.players.length >= maxPlayers) {
        return;
      }
      snapshot.players.push({
        id: userId,
        name: userName,
        isBot: false,
        isHost: false,
        isReady: false,
      });
    } else {
      snapshot.players[existingIndex] = {
        ...snapshot.players[existingIndex],
        name: userName,
        isBot: false,
      };
    }
    snapshot.phase = snapshot.phase === 'playing' || snapshot.phase === 'finished' ? snapshot.phase : 'roomLobby';
    this.state = snapshot;
    this.notify();
    this.runAutomation();
  }

  resetSession() {
    this.dispatch({ type: 'RESET_SESSION' });
  }

  dispatch(action) {
    const nextState = this.engine.reducer(this.state, action);
    const stateChanged = nextState !== this.state;
    this.state = nextState;
    if (stateChanged) {
      this.notify();
      this.runAutomation();
    }
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  runAutomation() {
    this.handleLobbyAutopilot();
    this.scheduleBotMove();
  }

  handleLobbyAutopilot() {
    if (this.state.phase !== 'roomLobby') return;
    const humans = this.state.players.filter((player) => !player.isBot);
    if (humans.length === 0) return;
    const humansReady = humans.every((player) => player.isReady);
    const botsNeedReady = this.state.players.some((player) => player.isBot && !player.isReady);
    if (humansReady && botsNeedReady) {
      this.dispatch({ type: 'AUTO_READY_BOTS' });
    }
  }

  scheduleBotMove() {
    this.clearBotTimeout();
    if (this.state.phase !== 'playing') return;
    if (!this.engine.getBotAction) return;
    const currentPlayer = this.state.players.find((player) => player.id === this.state.currentTurn);
    if (!currentPlayer || !currentPlayer.isBot) return;

    const delay = this.engine.botThinkDelay ?? 0;
    this.botTimeout = setTimeout(() => {
      const latestPlayer = this.state.players.find((player) => player.id === this.state.currentTurn);
      if (!latestPlayer || !latestPlayer.isBot) return;
      const action = this.engine.getBotAction(this.state, latestPlayer);
      if (action) {
        this.dispatch(action);
      }
    }, delay);
  }

  clearBotTimeout() {
    if (!this.botTimeout) return;
    clearTimeout(this.botTimeout);
    this.botTimeout = null;
  }
}

export const createPhotonClient = (engine) => new PhotonClient(engine);
