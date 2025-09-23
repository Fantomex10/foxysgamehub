import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { bootstrapPhotonRealtime } from './services/photon/realtimeBootstrap.js';
import { displayEnvDiagnostics } from './app/lib/envValidation.js';

const realtimeConfigured = bootstrapPhotonRealtime();
const envIssues = displayEnvDiagnostics();

if (
  import.meta?.env?.VITE_PHOTON_ADAPTER === 'realtime'
  && !realtimeConfigured
) {
  console.warn('[Photon] Realtime adapter selected but no transport factory is configured. Falling back to local adapter.');
}

if (typeof window !== 'undefined') {
  window.__APP_ENV_ISSUES__ = envIssues;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
