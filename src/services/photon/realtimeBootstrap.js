import { configurePhotonAdapter } from '../photonService.js';
import { getEnv } from '../../lib/config.js';

let externalTransportFactory = null;
let configured = false;

const warn = (message, detail) => {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[Photon] ${message}`, detail ?? '');
  }
};

const resolveEnvConfig = () => {
  const appId = getEnv('VITE_PHOTON_APP_ID');
  const region = getEnv('VITE_PHOTON_REGION');
  const appVersion = getEnv('VITE_PHOTON_APP_VERSION');
  if (!appId || !region) {
    return null;
  }
  return { appId, region, appVersion: appVersion || undefined };
};

const resolveGlobalFactory = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const factory = window.__PHOTON_TRANSPORT_FACTORY__;
  return typeof factory === 'function' ? factory : null;
};

const applyConfiguration = () => {
  const config = resolveEnvConfig();
  if (!config) {
    configured = false;
    return false;
  }

  const factory = externalTransportFactory ?? resolveGlobalFactory();
  if (typeof factory !== 'function') {
    configured = false;
    warn('Realtime transport factory missing. Register a factory via registerPhotonRealtimeTransport or set window.__PHOTON_TRANSPORT_FACTORY__.');
    return false;
  }

  configurePhotonAdapter('realtime', {
    transportFactory: ({ engine, options }) => factory({
      appId: config.appId,
      region: config.region,
      appVersion: config.appVersion,
      engine,
      options,
    }),
  });

  configured = true;
  return true;
};

export const registerPhotonRealtimeTransport = (factory) => {
  if (typeof factory !== 'function') {
    throw new Error('registerPhotonRealtimeTransport expects a function factory.');
  }
  externalTransportFactory = factory;
  return applyConfiguration();
};

export const bootstrapPhotonRealtime = () => applyConfiguration();

export const isPhotonRealtimeConfigured = () => configured;

if (typeof window !== 'undefined' && !window.__registerPhotonRealtimeTransport__) {
  window.__registerPhotonRealtimeTransport__ = registerPhotonRealtimeTransport;
}
