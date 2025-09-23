import { describe, expect, it } from 'vitest';
import { collectEnvIssues } from '../src/app/lib/envValidation.js';

describe('collectEnvIssues', () => {
  it('reports warning when both adapters are mock/local', () => {
    const issues = collectEnvIssues({}, {
      VITE_SESSION_ADAPTER: 'mock',
      VITE_PHOTON_ADAPTER: 'local',
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: 'mock-adapters-active',
      severity: 'warning',
    });
  });

  it('flags missing Firebase keys when firebase adapter is active', () => {
    const issues = collectEnvIssues({}, {
      VITE_SESSION_ADAPTER: 'firebase',
      VITE_FIREBASE_API_KEY: '',
      VITE_FIREBASE_AUTH_DOMAIN: '',
      VITE_FIREBASE_PROJECT_ID: '',
      VITE_FIREBASE_APP_ID: '',
    });
    const firebaseIssue = issues.find((issue) => issue.code === 'firebase-config-missing');
    expect(firebaseIssue?.severity).toBe('error');
  });

  it('does not flag Firebase when required keys exist', () => {
    const issues = collectEnvIssues({}, {
      VITE_SESSION_ADAPTER: 'firebase',
      VITE_FIREBASE_API_KEY: 'key',
      VITE_FIREBASE_AUTH_DOMAIN: 'auth.domain',
      VITE_FIREBASE_PROJECT_ID: 'project-id',
      VITE_FIREBASE_APP_ID: 'app-id',
    });
    expect(issues.some((issue) => issue.code === 'firebase-config-missing')).toBe(false);
  });

  it('flags missing Photon keys when realtime adapter is requested', () => {
    const issues = collectEnvIssues({}, {
      VITE_SESSION_ADAPTER: 'mock',
      VITE_PHOTON_ADAPTER: 'realtime',
      VITE_PHOTON_APP_ID: '',
      VITE_PHOTON_REGION: '',
    });
    const photonIssue = issues.find((issue) => issue.code === 'photon-config-missing');
    expect(photonIssue?.severity).toBe('error');
  });

  it('does not flag Photon when realtime keys exist', () => {
    const issues = collectEnvIssues({}, {
      VITE_SESSION_ADAPTER: 'mock',
      VITE_PHOTON_ADAPTER: 'realtime',
      VITE_PHOTON_APP_ID: 'app',
      VITE_PHOTON_REGION: 'us',
    });
    expect(issues.some((issue) => issue.code === 'photon-config-missing')).toBe(false);
  });
});
