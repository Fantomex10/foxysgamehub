import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';
import { ServiceConfigProvider } from '../src/app/context/ServiceConfigContext.jsx';
import { PhotonProvider } from '../src/app/context/PhotonContext.jsx';
import { SessionProvider } from '../src/app/context/SessionContext.jsx';
import { AppStateProvider, useAppState } from '../src/app/context/AppStateContext.jsx';
import { APP_PHASES } from '../src/app/constants.js';
import { sessionService } from '../src/services/sessionService.js';

const attachMockStorage = () => {
  const original = window.localStorage;
  let store = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => {
        store[key] = value;
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    },
    configurable: true,
  });
  return () => {
    Object.defineProperty(window, 'localStorage', {
      value: original,
      configurable: true,
    });
  };
};

const Providers = ({ children }) => (
  <ThemeProvider>
    <CustomizationProvider>
      <ServiceConfigProvider>
        <PhotonProvider>
          <SessionProvider>
            <AppStateProvider>{children}</AppStateProvider>
          </SessionProvider>
        </PhotonProvider>
      </ServiceConfigProvider>
    </CustomizationProvider>
  </ThemeProvider>
);

describe('AppState integration', () => {
  let restoreStorage;
  beforeEach(() => {
    restoreStorage = attachMockStorage();
    vi.spyOn(sessionService, 'ensureUserSession').mockResolvedValue({
      uid: 'test-user',
      displayName: 'Player',
      isAnonymous: true,
    });
    vi.spyOn(sessionService, 'fetchCustomizationConfig').mockResolvedValue(null);
    vi.spyOn(sessionService, 'upsertCustomizationConfig').mockResolvedValue({ updatedAt: new Date().toISOString() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreStorage?.();
  });

  it('resets phase when service adapters change', async () => {
    const { result } = renderHook(() => useAppState(), { wrapper: Providers });

    await waitFor(() => expect(result.current.authReady).toBe(true));

    act(() => {
      result.current.setAppPhase(APP_PHASES.ROOM);
    });
    expect(result.current.appPhase).toBe(APP_PHASES.ROOM);

    const nextPhotonAdapter = result.current.availablePhotonAdapters.find((key) => key !== result.current.serviceConfig.photonAdapter) ?? result.current.serviceConfig.photonAdapter;

    act(() => {
      result.current.updateServiceConfig({
        photonAdapter: nextPhotonAdapter,
        sessionAdapter: result.current.serviceConfig.sessionAdapter,
      });
    });

    await waitFor(() => expect(result.current.serviceConfig.photonAdapter).toBe(nextPhotonAdapter));
    await waitFor(() => expect(result.current.appPhase).toBe(APP_PHASES.LOGIN));
    expect(result.current.availableRooms).toHaveLength(0);
  });

  it('updates auth user display name via room actions', async () => {
    const { result } = renderHook(() => useAppState(), { wrapper: Providers });
    await waitFor(() => expect(result.current.authReady).toBe(true));

    act(() => {
      result.current.roomActions.updateUserDisplayName('New Alias');
    });

    await waitFor(() => expect(result.current.authUser?.displayName).toBe('New Alias'));
    await waitFor(() => expect(result.current.state.userName).toBe('New Alias'));
  });
});
