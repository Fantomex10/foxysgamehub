import { describe, expect, it, vi } from 'vitest';
import { createReducer, createInitialStateFactory } from '../src/games/shared/reducerFactory.js';

describe('reducerFactory', () => {
  it('creates a reducer that delegates to the action map', () => {
    const handler = vi.fn((state, action) => ({ ...state, value: action.payload }));
    const reducer = createReducer({ SET_VALUE: handler });

    const baseState = { value: 0 };
    const nextState = reducer(baseState, { type: 'SET_VALUE', payload: 5 });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(baseState, { type: 'SET_VALUE', payload: 5 });
    expect(nextState).toEqual({ value: 5 });
    expect(reducer(baseState, { type: 'UNKNOWN' })).toBe(baseState);
    expect(reducer(baseState)).toBe(baseState);
  });

  it('throws if action map is not provided', () => {
    expect(() => createReducer()).toThrow(TypeError);
    expect(() => createReducer(null)).toThrow(TypeError);
  });

  it('creates an initial state factory that applies overrides', () => {
    const builder = vi.fn(() => ({ userId: 'base-id', userName: 'Base', meta: 1 }));
    const createInitialState = createInitialStateFactory(builder);

    const defaultState = createInitialState();
    expect(defaultState).toMatchObject({ userId: 'base-id', userName: 'Base', meta: 1 });

    const overridden = createInitialState({ userId: 'override', userName: 'Player' });
    expect(overridden.userId).toBe('override');
    expect(overridden.userName).toBe('Player');
    expect(overridden.meta).toBe(1);

    const ignored = createInitialState({ userName: null });
    expect(ignored.userName).toBe('Base');

    expect(builder).toHaveBeenCalledTimes(3);
  });

  it('throws if base state builder is not a function', () => {
    expect(() => createInitialStateFactory()).toThrow(TypeError);
    expect(() => createInitialStateFactory({})).toThrow(TypeError);
  });
});
