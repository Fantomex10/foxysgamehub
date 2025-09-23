import { logAppEvent } from './telemetry.js';

const hasValue = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  return lower !== 'undefined' && lower !== 'null';
};

const REQUIRED_FIREBASE_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

const REQUIRED_PHOTON_KEYS = [
  'VITE_PHOTON_APP_ID',
  'VITE_PHOTON_REGION',
];

const baseEnv = () => (
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : {}
);

const normalise = (value) => (hasValue(value) ? value.trim() : undefined);

const createIssue = (code, severity, message, suggestion) => ({
  code,
  severity,
  message,
  suggestion,
});

export const collectEnvIssues = (overrides = {}, providedEnv = {}) => {
  const env = { ...baseEnv(), ...providedEnv, ...overrides };
  const issues = [];

  const sessionAdapter = normalise(env.VITE_SESSION_ADAPTER)?.toLowerCase() ?? 'firebase';
  if (sessionAdapter === 'firebase') {
    const missing = REQUIRED_FIREBASE_KEYS.filter((key) => !hasValue(env[key]));
    if (missing.length > 0) {
      issues.push(createIssue(
        'firebase-config-missing',
        'error',
        `Missing Firebase configuration values: ${missing.join(', ')}.`,
        'Populate VITE_FIREBASE_* keys in your environment or set VITE_SESSION_ADAPTER=mock for offline development.',
      ));
    }
  }

  const photonAdapter = normalise(env.VITE_PHOTON_ADAPTER)?.toLowerCase() ?? 'local';
  if (photonAdapter === 'realtime') {
    const missingPhoton = REQUIRED_PHOTON_KEYS.filter((key) => !hasValue(env[key]));
    if (missingPhoton.length > 0) {
      issues.push(createIssue(
        'photon-config-missing',
        'error',
        `Missing Photon realtime configuration values: ${missingPhoton.join(', ')}.`,
        'Set the required VITE_PHOTON_* keys or switch adapters via VITE_PHOTON_ADAPTER=local while configuring the service.',
      ));
    }
    if (!(hasValue(env.VITE_PHOTON_APP_VERSION) || hasValue(env.VITE_APP_VERSION))) {
      issues.push(createIssue(
        'photon-app-version-missing',
        'warning',
        'Realtime adapter selected but no app version was provided.',
        'Set VITE_PHOTON_APP_VERSION (preferred) or VITE_APP_VERSION so the transport can surface build metadata.',
      ));
    }
  }

  if (sessionAdapter === 'mock' && photonAdapter === 'local') {
    issues.push(createIssue(
      'mock-adapters-active',
      'warning',
      'Both session and photon adapters are using mock implementations.',
      'Enable realtime adapters before shipping to staging or production.',
    ));
  }

  return issues;
};

export const displayEnvDiagnostics = () => {
  const issues = collectEnvIssues();

  if (typeof window !== 'undefined') {
    window.__APP_ENV_ISSUES__ = issues;
  }

  issues.forEach((issue) => {
    logAppEvent('env:issue', {
      code: issue.code,
      severity: issue.severity,
      message: issue.message,
    });
    const logger = issue.severity === 'error' ? console.error : console.warn;
    logger?.(`[Env] ${issue.message}${issue.suggestion ? `\n → ${issue.suggestion}` : ''}`);
  });

  return issues;
};
