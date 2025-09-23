import { PhotonClient } from '../photonClient.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

const defaultFactory = () => {
  throw new Error('[Photon] Realtime adapter requires a transportFactory.');
};

export class RealtimePhotonClient extends PhotonClient {
  constructor(engine, { transportFactory = defaultFactory } = {}) {
    super(engine);
    this.transportFactory = transportFactory;
    this.transport = null;
    this.transportCleanup = () => {};
  }

  async connect(options = {}) {
    this.setStatus('connecting');
    try {
      this.transportCleanup();
      this.transport = null;

      if (options.engineId && this.engine?.id !== options.engineId) {
        const error = new Error(`PhotonClient engine mismatch: expected ${this.engine?.id}, received ${options.engineId}`);
        this.setStatus('error', error);
        throw error;
      }

      const seedState = this.engine.createInitialState({
        userId: options.userId,
        userName: options.userName ?? '',
      });
      this.state = clone(seedState);
      this.snapshotCache = null;
      this.notify();

      const transport = this.transportFactory({ engine: this.engine, options });
      if (!transport) {
        throw new Error('[Photon] transportFactory did not return a transport instance.');
      }
      this.transport = transport;
      this.setupTransportListeners(transport);
      if (typeof transport.connect === 'function') {
        await transport.connect(options);
      }
      this.setStatus('connected');
      return this.state;
    } catch (error) {
      this.setStatus('error', error);
      throw error;
    }
  }

  setupTransportListeners(transport) {
    const cleanups = [];
    if (typeof transport.onSnapshot === 'function') {
      cleanups.push(transport.onSnapshot((snapshot) => {
        try {
          this.state = clone(snapshot);
          this.notify();
        } catch (error) {
          this.setStatus('error', error);
        }
      }));
    }

    if (typeof transport.onEvent === 'function') {
      cleanups.push(transport.onEvent((action) => {
        try {
          this.dispatch(action);
        } catch (error) {
          this.setStatus('error', error);
        }
      }));
    }

    if (typeof transport.onDisconnected === 'function') {
      cleanups.push(transport.onDisconnected((error) => {
        this.setStatus('disconnected', error ?? null);
      }));
    }

    if (typeof transport.onError === 'function') {
      cleanups.push(transport.onError((error) => {
        this.setStatus('error', error);
      }));
    }

    this.transportCleanup = () => {
      for (const cleanup of cleanups) {
        try {
          if (typeof cleanup === 'function') cleanup();
        } catch (error) {
          console.warn('[Photon] transport cleanup failed', error);
        }
      }
      this.transportCleanup = () => {};
    };
  }

  async disconnect() {
    try {
      if (this.transport && typeof this.transport.disconnect === 'function') {
        await this.transport.disconnect();
      }
    } finally {
      this.transportCleanup();
      this.transport = null;
      super.disconnect();
    }
  }

  sendRemoteAction(type, payload = {}) {
    if (!this.transport || typeof this.transport.sendAction !== 'function') {
      throw new Error('[Photon] Transport not initialised. Did you call connect()?');
    }
    return this.transport.sendAction({ type, payload });
  }

  createRoom(options) {
    return this.sendRemoteAction('CREATE_ROOM', { settings: options?.settings, roomId: options?.roomId });
  }

  toggleReady(playerId) {
    return this.sendRemoteAction('TOGGLE_READY', { playerId });
  }

  setPlayerStatus(playerId, status) {
    return this.sendRemoteAction('SET_PLAYER_STATUS', { playerId, status });
  }

  updateSeatLayout(layout) {
    return this.sendRemoteAction('SET_SEAT_LAYOUT', layout);
  }

  addBot() {
    return this.sendRemoteAction('ADD_BOT');
  }

  removeBot() {
    return this.sendRemoteAction('REMOVE_BOT');
  }

  startGame() {
    return this.sendRemoteAction('START_GAME');
  }

  playCard(playerId, card, chosenSuit) {
    return this.sendRemoteAction('PLAY_CARD', { playerId, card, chosenSuit });
  }

  drawCard(playerId) {
    return this.sendRemoteAction('DRAW_CARD', { playerId });
  }

  returnToLobby() {
    return this.sendRemoteAction('RETURN_TO_LOBBY');
  }

  resetSession() {
    this.sendRemoteAction('RESET_SESSION');
  }
}

export const createRealtimePhotonClient = (engine, options) => new RealtimePhotonClient(engine, options);
