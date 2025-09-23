import { PhotonClientBase } from './photon/baseClient.js';
import { cloneState } from './photon/stateUtils.js';

export class PhotonClient extends PhotonClientBase {
  async connect({ userId, userName, engineId } = {}) {
    this.setStatus('connecting');

    if (engineId && this.engine?.id !== engineId) {
      const error = new Error(`PhotonClient engine mismatch: expected ${this.engine?.id}, received ${engineId}`);
      this.setStatus('error', error);
      throw error;
    }

    this.state = cloneState(
      this.engine.createInitialState({
        userId,
        userName: userName ?? '',
      }),
    );
    this.snapshotCache = null;
    this.notify();
    this.runAutomation();
    this.setStatus('connected');

    return this.state;
  }
}

export const createPhotonClient = (engine) => new PhotonClient(engine);
