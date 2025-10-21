import { useCallback, useMemo, useRef, useState } from 'react';

const shouldEnableSeatManager = (isHost, onUpdateSeats) =>
  isHost && typeof onUpdateSeats === 'function';

/**
 * Manages seat manager dialog orchestration and queues seat configurations
 * so callers can assert what was last submitted during tests.
 */
export const useSeatManagerActions = ({ isHost, onUpdateSeats }) => {
  const [seatManagerOpen, setSeatManagerOpen] = useState(false);
  const queuedConfigRef = useRef(null);

  const seatManagerEnabled = useMemo(
    () => shouldEnableSeatManager(isHost, onUpdateSeats),
    [isHost, onUpdateSeats],
  );

  const openSeatManager = useCallback(() => {
    if (!seatManagerEnabled) return;
    setSeatManagerOpen(true);
  }, [seatManagerEnabled]);

  const closeSeatManager = useCallback(() => {
    setSeatManagerOpen(false);
  }, []);

  const resetQueueAndClose = useCallback(() => {
    queuedConfigRef.current = null;
    closeSeatManager();
  }, [closeSeatManager]);

  const handleSeatManagerApply = useCallback(
    (configOrUpdater) => {
      if (!seatManagerEnabled) {
        resetQueueAndClose();
        return Promise.resolve(undefined);
      }

      const currentConfig = queuedConfigRef.current;
      const nextConfig =
        typeof configOrUpdater === 'function'
          ? configOrUpdater(currentConfig)
          : configOrUpdater;

      if (!nextConfig) {
        resetQueueAndClose();
        return Promise.resolve(undefined);
      }

      queuedConfigRef.current = nextConfig;
      const result = onUpdateSeats(nextConfig);

      if (result && typeof result.then === 'function') {
        return result.finally(resetQueueAndClose);
      }

      resetQueueAndClose();
      return Promise.resolve(result);
    },
    [seatManagerEnabled, onUpdateSeats, resetQueueAndClose],
  );

  const getQueuedConfig = useCallback(() => queuedConfigRef.current, []);

  return {
    seatManagerEnabled,
    seatManagerOpen,
    openSeatManager,
    closeSeatManager,
    handleSeatManagerApply,
    getQueuedConfig,
  };
};
