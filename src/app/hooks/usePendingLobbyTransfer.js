import { useCallback, useEffect, useState } from 'react';
import { getGameEngineById } from '../../games/index.js';

export const usePendingLobbyTransfer = ({
  engine,
  profileLoaded,
  setEngine,
  performCreateLobby,
}) => {
  const [pendingCreateConfig, setPendingCreateConfig] = useState(null);

  useEffect(() => {
    if (!pendingCreateConfig || !profileLoaded) return;
    const targetEngine = getGameEngineById(pendingCreateConfig.engineId) ?? engine;
    if (targetEngine.id !== engine.id) {
      return;
    }
    performCreateLobby(pendingCreateConfig, targetEngine);
    setPendingCreateConfig(null);
  }, [pendingCreateConfig, profileLoaded, engine, performCreateLobby]);

  const requestTransfer = useCallback((config) => {
    const targetEngine = getGameEngineById(config.engineId) ?? engine;
    if (targetEngine.id !== engine.id) {
      setPendingCreateConfig(config);
      setEngine(targetEngine);
      return { queued: true, targetEngine };
    }
    return { queued: false, targetEngine };
  }, [engine, setEngine]);

  const clearPending = useCallback(() => {
    setPendingCreateConfig(null);
  }, []);

  return {
    pendingCreateConfig,
    requestTransfer,
    clearPending,
  };
};
