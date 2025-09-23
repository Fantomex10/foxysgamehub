import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEngineCatalog } from '../src/app/hooks/useEngineCatalog.js';
import { crazyEightsEngine } from '../src/games/crazyEights/index.js';
import { listGameEngines } from '../src/games/index.js';

describe('useEngineCatalog', () => {
  it('returns available engines, options, and modules for the active engine', () => {
    const { result } = renderHook(() => useEngineCatalog(crazyEightsEngine));

    expect(result.current.engines).toEqual(listGameEngines());
    expect(result.current.gameOptions).toEqual(
      listGameEngines().map(({ id, name }) => ({ id, name })),
    );
    expect(result.current.engineModules.table).toBeDefined();
  });
});
