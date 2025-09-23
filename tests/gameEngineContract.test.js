import { describe, expect, it } from 'vitest';
import { createGameEngine } from '../src/games/engineTypes.js';
import {
  registerGameEngine,
  unregisterGameEngine,
  getGameEngineById,
} from '../src/games/index.js';

describe('Game engine contract', () => {
  const baseDefinition = {
    id: 'dummy-engine',
    name: 'Dummy Engine',
    components: {
      Table: () => null,
    },
    createInitialState: () => ({ phase: 'idle', players: [] }),
    reducer: (state) => state,
  };

  it('throws when table module is missing a component', () => {
    expect(() => createGameEngine({
      ...baseDefinition,
      components: {},
      modules: {
        table: {
          getMenuSections: () => [],
        },
      },
    })).toThrow(/components.Table/);
  });

  it('allows registering a custom engine and retrieving it', () => {
    const engine = createGameEngine(baseDefinition);
    registerGameEngine(engine);
    expect(getGameEngineById('dummy-engine')).toBe(engine);
    unregisterGameEngine('dummy-engine');
  });
});
