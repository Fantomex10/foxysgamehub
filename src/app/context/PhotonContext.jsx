/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getDefaultGameEngine } from '../../games/index.js';
import { photonService } from '../../services/photonService.js';
import { useServiceConfig } from './ServiceConfigContext.jsx';
import { logAppEvent } from '../lib/telemetry.js';

const PhotonContext = createContext(null);

const defaultEngine = getDefaultGameEngine();

export const PhotonProvider = ({ children }) => {
  const { serviceConfig, version: serviceConfigVersion } = useServiceConfig();
  const [engine, setEngine] = useState(defaultEngine);
  const [photon, setPhoton] = useState(() => photonService.createClient(defaultEngine));
  const [photonStatus, setPhotonStatus] = useState(() => (
    typeof photon.getStatus === 'function' ? photon.getStatus() : { status: 'idle', error: null }
  ));

  const adapterKeyRef = useRef(serviceConfig.photonAdapter);
  const requestedAdapter = photon?.__requestedAdapter ?? photon?.__adapter;
  const effectiveAdapter = photon?.__effectiveAdapter ?? photon?.__adapter;

  useEffect(() => {
    return () => {
      photon.disconnect?.();
    };
  }, [photon]);

  useEffect(() => {
    if (typeof photon.subscribeStatus !== 'function') {
      setPhotonStatus({ status: 'idle', error: null });
      return undefined;
    }
    const unsubscribe = photon.subscribeStatus((nextStatus) => {
      setPhotonStatus(nextStatus ?? { status: 'idle', error: null });
    });
    return () => {
      unsubscribe?.();
    };
  }, [photon]);

  useEffect(() => {
    if (!photonStatus) return;
    logAppEvent('photon:status', {
      adapter: serviceConfig.photonAdapter,
      effectiveAdapter,
      status: photonStatus.status,
      error: photonStatus.error?.message,
    });
  }, [photonStatus, serviceConfig.photonAdapter, effectiveAdapter]);

  useEffect(() => {
    if (
      adapterKeyRef.current === serviceConfig.photonAdapter
      && requestedAdapter === serviceConfig.photonAdapter
    ) {
      return;
    }

    adapterKeyRef.current = serviceConfig.photonAdapter;
    setPhoton((current) => {
      current?.disconnect?.();
      const nextClient = photonService.createClient(engine);
      setPhotonStatus(typeof nextClient.getStatus === 'function'
        ? nextClient.getStatus()
        : { status: 'idle', error: null });
      return nextClient;
    });
  }, [engine, serviceConfig.photonAdapter, serviceConfigVersion, requestedAdapter]);

  const contextValue = useMemo(
    () => ({
      engine,
      setEngine,
      photon,
      photonStatus,
      adapterKey: serviceConfig.photonAdapter,
      requestedAdapter,
      effectiveAdapter,
      resetPhoton: () => {
        photon.resetSession?.();
        setPhotonStatus(typeof photon.getStatus === 'function'
          ? photon.getStatus()
          : { status: 'idle', error: null });
      },
    }),
    [engine, photon, photonStatus, serviceConfig.photonAdapter, requestedAdapter, effectiveAdapter],
  );

  return (
    <PhotonContext.Provider value={contextValue}>
      {children}
    </PhotonContext.Provider>
  );
};

export const usePhoton = () => {
  const context = useContext(PhotonContext);
  if (!context) {
    throw new Error('usePhoton must be used within a PhotonProvider');
  }
  return context;
};
