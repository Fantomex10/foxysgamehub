/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { listSessionAdapters, setSessionAdapter } from '../../services/sessionService.js';
import { isPhotonAdapterConfigured, listPhotonAdapters, setPhotonAdapter } from '../../services/photonService.js';
import { defaultServiceConfig, loadServiceConfig, persistServiceConfig } from '../../state/serviceConfig.js';

const ServiceConfigContext = createContext(null);

export const ServiceConfigProvider = ({ children }) => {
  const sessionAdapters = listSessionAdapters();
  const photonAdapters = listPhotonAdapters();

  const sanitiseServiceConfig = useCallback(
    (config = {}) => {
      const defaults = defaultServiceConfig();
      const next = { ...defaults, ...config };

      const sessionAdapter = sessionAdapters.includes(next.sessionAdapter)
        ? next.sessionAdapter
        : defaults.sessionAdapter;

      let photonAdapter = photonAdapters.includes(next.photonAdapter)
        ? next.photonAdapter
        : (photonAdapters[0] ?? defaults.photonAdapter);

      if (!isPhotonAdapterConfigured(photonAdapter)) {
        photonAdapter = defaults.photonAdapter;
      }

      return { sessionAdapter, photonAdapter };
    },
    [sessionAdapters, photonAdapters],
  );

  const [serviceConfig, setServiceConfigState] = useState(() => {
    const initial = sanitiseServiceConfig(loadServiceConfig());
    setSessionAdapter(initial.sessionAdapter);
    setPhotonAdapter(initial.photonAdapter);
    return initial;
  });

  const [version, setVersion] = useState(0);

  const updateServiceConfig = useCallback(
    (updater) => {
      setServiceConfigState((current) => {
        const candidate = typeof updater === 'function'
          ? updater(current)
          : { ...current, ...updater };
        const next = sanitiseServiceConfig(candidate);
        if (
          next.sessionAdapter === current.sessionAdapter
          && next.photonAdapter === current.photonAdapter
        ) {
          return current;
        }
        setSessionAdapter(next.sessionAdapter);
        setPhotonAdapter(next.photonAdapter);
        persistServiceConfig(next);
        setVersion((current) => current + 1);
        return next;
      });
    },
    [sanitiseServiceConfig],
  );

  const contextValue = useMemo(
    () => ({
      serviceConfig,
      updateServiceConfig,
      sessionAdapters,
      photonAdapters,
      version,
    }),
    [serviceConfig, updateServiceConfig, sessionAdapters, photonAdapters, version],
  );

  return (
    <ServiceConfigContext.Provider value={contextValue}>
      {children}
    </ServiceConfigContext.Provider>
  );
};

export const useServiceConfig = () => {
  const context = useContext(ServiceConfigContext);
  if (!context) {
    throw new Error('useServiceConfig must be used within a ServiceConfigProvider');
  }
  return context;
};
