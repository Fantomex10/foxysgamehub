import { describe, expect, it } from 'vitest';
import { createPhotonClient } from '../src/services/photonClient.js';

describe('PhotonClient status lifecycle', () => {
  const engine = {
    id: 'test-engine',
    createInitialState: ({ userId = 'player-1', userName = '' } = {}) => ({
      userId,
      userName,
      phase: 'idle',
      roomId: null,
      players: [],
      spectators: [],
      hands: {},
    }),
    reducer: (state) => state,
  };

  it('emits idle → connecting → connected on successful connect', async () => {
    const client = createPhotonClient(engine);
    const statuses = [];
    client.subscribeStatus((snapshot) => {
      statuses.push(snapshot.status);
    });

    await client.connect({ userId: 'alpha' });

    expect(statuses[0]).toBe('idle');
    expect(statuses).toContain('connecting');
    expect(statuses.at(-1)).toBe('connected');
  });

  it('emits error status on engine mismatch', async () => {
    const client = createPhotonClient(engine);
    const statuses = [];
    client.subscribeStatus((snapshot) => {
      statuses.push(snapshot.status);
    });

    await expect(client.connect({ engineId: 'other-engine' })).rejects.toThrow();
    expect(statuses).toContain('error');
  });

  it('resets status to idle after resetSession', async () => {
    const client = createPhotonClient(engine);
    await client.connect({ userId: 'beta' });
    client.resetSession();
    const { status } = client.getStatus();
    expect(status).toBe('idle');
  });

  it('caches frozen snapshots and refreshes after state changes', async () => {
    const snapshotEngine = {
      id: 'snapshot-engine',
      createInitialState: () => ({
        userId: 'user-1',
        userName: 'Player One',
        phase: 'idle',
        roomId: null,
        players: [],
        spectators: [],
        hands: {},
        history: [],
      }),
      reducer: (state, action) => {
        if (action.type === 'ADD_HISTORY') {
          return {
            ...state,
            history: [...state.history, action.payload],
          };
        }
        return state;
      },
    };

    const client = createPhotonClient(snapshotEngine);
    await client.connect();

    const firstSnapshot = client.exportRoomSnapshot();
    expect(Object.isFrozen(firstSnapshot)).toBe(true);
    expect(client.exportRoomSnapshot()).toBe(firstSnapshot);
    expect(() => {
      firstSnapshot.phase = 'mutated';
    }).toThrow();

    client.dispatch({ type: 'ADD_HISTORY', payload: 'event-1' });

    const secondSnapshot = client.exportRoomSnapshot();
    expect(secondSnapshot).not.toBe(firstSnapshot);
    expect(secondSnapshot.history).toEqual(['event-1']);
    expect(Object.isFrozen(secondSnapshot)).toBe(true);
  });
});
