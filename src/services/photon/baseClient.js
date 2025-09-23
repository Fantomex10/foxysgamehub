import {
  cloneState,
  freezeSnapshot,
} from './stateUtils.js';
import { hydrateRoomSnapshot } from './snapshotLoader.js';
import {
  getBotThinkDelay,
  resolveBotTurnPlayer,
  selectBotAction,
  shouldAutoReadyBots,
} from './automation.js';

export class PhotonClientBase {
  constructor(engine) {
    this.engine = engine;
    this.state = cloneState(engine.createInitialState());
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.statusState = { status: 'idle', error: null };
    this.botTimeout = null;
    this.snapshotCache = null;
  }

  setEngine(engine) {
    if (this.engine?.id === engine.id) return;
    this.clearBotTimeout();
    this.engine = engine;
    this.state = cloneState(engine.createInitialState({
      userId: this.state.userId,
      userName: this.state.userName,
    }));
    this.snapshotCache = null;
    this.notify();
    this.setStatus('idle');
  }

  getState() {
    return this.state;
  }

  getStatus() {
    return this.statusState;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setDisplayName(name) {
    this.dispatch({ type: 'SET_NAME', payload: name });
  }

  disconnect() {
    this.clearBotTimeout();
    this.setStatus('disconnected');
    this.listeners.clear();
    this.statusListeners.clear();
  }

  subscribeStatus(listener) {
    this.statusListeners.add(listener);
    listener(this.statusState);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  setStatus(status, error = null) {
    const next = { status, error };
    const changed =
      next.status !== this.statusState.status
      || next.error !== this.statusState.error;
    if (!changed) {
      return;
    }
    this.statusState = next;
    for (const listener of this.statusListeners) {
      listener(this.statusState);
    }
  }

  createRoom(options) {
    this.dispatch({ type: 'CREATE_ROOM', payload: { settings: options?.settings, roomId: options?.roomId } });
  }

  toggleReady(playerId) {
    this.dispatch({ type: 'TOGGLE_READY', payload: { playerId } });
  }

  setPlayerStatus(playerId, status) {
    this.dispatch({ type: 'SET_PLAYER_STATUS', payload: { playerId, status } });
  }

  updateSeatLayout({ seatOrder, benchOrder, maxSeats, kickedIds }) {
    this.dispatch({
      type: 'SET_SEAT_LAYOUT',
      payload: { seatOrder, benchOrder, maxSeats, kickedIds },
    });
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

  resetSession() {
    this.dispatch({ type: 'RESET_SESSION' });
    this.setStatus('idle');
  }

  loadRoom(roomState, currentUser) {
    this.clearBotTimeout();
    const snapshot = hydrateRoomSnapshot(roomState, {
      currentState: this.state,
      currentUser,
    });
    this.state = snapshot;
    this.snapshotCache = null;
    this.notify();
    this.runAutomation();
    this.setStatus('connected');
  }

  exportRoomSnapshot() {
    if (!this.snapshotCache) {
      this.snapshotCache = freezeSnapshot(cloneState(this.state));
    }
    return this.snapshotCache;
  }

  dispatch(action) {
    const nextState = this.engine.reducer(this.state, action);
    const stateChanged = nextState !== this.state;
    this.state = nextState;
    if (stateChanged) {
      this.snapshotCache = null;
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
    if (shouldAutoReadyBots(this.state)) {
      this.dispatch({ type: 'AUTO_READY_BOTS' });
    }
  }

  scheduleBotMove() {
    this.clearBotTimeout();
    const currentBot = resolveBotTurnPlayer(this.state);
    if (!currentBot) return;

    const delay = getBotThinkDelay(this.engine);
    this.botTimeout = setTimeout(() => {
      const latestBot = resolveBotTurnPlayer(this.state);
      if (!latestBot) return;
      const action = selectBotAction(this.engine, this.state, latestBot);
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

  connect() {
    throw new Error('PhotonClientBase.connect must be implemented by subclasses');
  }
}
