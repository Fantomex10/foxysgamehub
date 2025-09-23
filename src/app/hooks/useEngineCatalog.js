import { useMemo } from 'react';
import { listGameEngines } from '../../games/index.js';
import { resolveEngineModules } from '../modules/engineModules.js';

export const useEngineCatalog = (engine) => {
  const engines = useMemo(() => listGameEngines(), []);

  const gameOptions = useMemo(
    () => engines.map(({ id, name }) => ({ id, name })),
    [engines],
  );

  const engineModules = useMemo(
    () => resolveEngineModules(engine),
    [engine],
  );

  return {
    engines,
    gameOptions,
    engineModules,
  };
};
