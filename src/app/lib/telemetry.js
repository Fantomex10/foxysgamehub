const listeners = new Set();

export const logAppEvent = (type, detail = {}) => {
  const payload = { type, detail, timestamp: Date.now() };
  if (listeners.size > 0) {
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch (error) {
        console.warn('[Telemetry] listener failed', error);
      }
    }
    return;
  }

  if (typeof console !== 'undefined' && console.info) {
    console.info('[AppEvent]', type, detail);
  }
};

export const subscribeAppEvents = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
