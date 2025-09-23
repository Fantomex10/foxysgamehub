import { describe, expect, it } from 'vitest';
import {
  createRoomBindings,
  createInitialState,
  defaultRoomBindings,
  roomReducer,
} from '../src/state/roomReducer.js';

describe('state/roomReducer helpers', () => {
  it('resolves bindings for a specific engine id', () => {
    const bindings = createRoomBindings('hearts');
    expect(bindings.engine.id).toBe('hearts');
    expect(typeof bindings.reducer).toBe('function');

    const state = bindings.createInitialState({ userId: 'tester-1', userName: 'Tester' });
    expect(state.userId).toBe('tester-1');
    expect(state.roundNumber).toBe(0); // hearts specific field
  });

  it('createInitialState accepts an engine identifier through options', () => {
    const state = createInitialState({ userId: 'tester-2', userName: 'Tester', engine: 'hearts' });
    expect(state.userId).toBe('tester-2');
    expect(state.roundNumber).toBe(0);
  });

  it('shares reducer reference with default bindings', () => {
    expect(defaultRoomBindings.reducer).toBe(roomReducer);
  });
});
