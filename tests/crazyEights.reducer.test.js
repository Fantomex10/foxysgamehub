import { describe, expect, it } from 'vitest';
import { createInitialState, roomReducer } from '../src/games/crazyEights/state/roomReducer.js';

const hostId = 'player-host';
const hostName = 'Host Player';

const createLobbyState = () => {
  let state = createInitialState({ userId: hostId, userName: hostName });
  state = roomReducer(state, { type: 'SET_NAME', payload: hostName });
  state = roomReducer(state, {
    type: 'CREATE_ROOM',
    payload: { settings: { roomName: 'Test Lounge' }, roomId: 'ROOM' },
  });
  return state;
};

describe('crazyEights roomReducer', () => {
  it('requires at least two ready players before starting', () => {
    let state = createLobbyState();

    expect(state.phase).toBe('roomLobby');
    expect(state.players).toHaveLength(1);

    const untouched = roomReducer(state, { type: 'START_GAME' });
    expect(untouched.phase).toBe('roomLobby');
    expect(untouched.banner).toContain('Need at least two ready players');
  });

  it('starts a game once host and bot are ready', () => {
    let state = createLobbyState();

    state = roomReducer(state, { type: 'ADD_BOT' });
    expect(state.players.length).toBeGreaterThanOrEqual(2);

    // Mark all participants ready
    for (const player of state.players) {
      state = roomReducer(state, { type: 'TOGGLE_READY', payload: { playerId: player.id } });
    }

    state = roomReducer(state, { type: 'START_GAME' });

    expect(state.phase).toBe('playing');
    expect(state.currentTurn).toBe(state.players[0].id);
    expect(state.hands[state.players[0].id]?.length).toBeGreaterThan(0);
    expect(state.drawPile.length).toBeGreaterThan(0);
    expect(state.banner).toContain(state.players[0].name);
  });
});
