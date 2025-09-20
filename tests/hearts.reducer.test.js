import { describe, expect, it } from 'vitest';
import { createInitialState, roomReducer } from '../src/games/hearts/state/roomReducer.js';

const hostId = 'hearts-host';
const hostName = 'Hearts Host';

describe('hearts roomReducer', () => {
  it('starts a round when four players are ready', () => {
    let state = createInitialState({ userId: hostId, userName: hostName });
    state = roomReducer(state, { type: 'SET_NAME', payload: hostName });

    state = roomReducer(state, {
      type: 'CREATE_ROOM',
      payload: { settings: { roomName: 'Hearts Suite' }, roomId: 'HRTS' },
    });

    expect(state.phase).toBe('roomLobby');
    expect(state.players).toHaveLength(4);

    for (const player of state.players) {
      state = roomReducer(state, { type: 'TOGGLE_READY', payload: { playerId: player.id } });
    }

    state = roomReducer(state, { type: 'START_GAME' });

    expect(state.phase).toBe('playing');
    expect(Object.keys(state.hands)).toHaveLength(4);
    expect(state.currentTurn).toBeTruthy();
    expect(state.banner).toContain('lead');
    expect(state.roundNumber).toBeGreaterThan(0);
  });
});
