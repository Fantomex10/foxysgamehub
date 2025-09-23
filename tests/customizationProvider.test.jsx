import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { CustomizationProvider, useCustomization, useCustomizationTokens } from '../src/customization/CustomizationContext.jsx';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { getCardSkinById } from '../src/customization/skins/cards.js';

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

const wrapper = ({ children }) => (
  <ThemeProvider>
    <CustomizationProvider>{children}</CustomizationProvider>
  </ThemeProvider>
);

describe('CustomizationProvider', () => {
  let restoreStorage;

  beforeEach(() => {
    restoreStorage = attachMockStorage();
  });

  afterEach(() => {
    restoreStorage?.();
  });

  it('applies presets and accessibility toggles', () => {
    const { result } = renderHook(() => useCustomization(), { wrapper });

    act(() => {
      result.current.unlockItems([
        'skin.cards.aurora',
        'skin.table.aurora-veil',
        'skin.pieces.aurora',
        'backdrop.aurora-sky',
      ]);
    });

    act(() => {
      result.current.applyPreset('aurora-bloom', { force: true });
    });

    expect(result.current.state.themeId).toBe('aurora');
    expect(result.current.state.cardSkinId).toBe('aurora');
    expect(result.current.state.presetId).toBe('aurora-bloom');

    act(() => {
      result.current.toggleAccessibility('highContrast');
    });

    expect(result.current.state.accessibility.highContrast).toBe(true);
  });

  it('merges customization tokens when skins change', () => {
    const { result } = renderHook(
      () => ({
        api: useCustomization(),
        tokens: useCustomizationTokens(),
      }),
      { wrapper },
    );

    act(() => {
      result.current.api.unlockItem('skin.cards.aurora');
    });

    act(() => {
      result.current.api.setCardSkin('aurora', { force: true });
    });

    expect(result.current.tokens.cards.accent).toBe(getCardSkinById('aurora').tokens.accent);
  });

  it('hydrates from remote profile and updates sync status', () => {
    const { result } = renderHook(() => useCustomization(), { wrapper });

    const remotePayload = {
      ...result.current.state,
      cardSkinId: 'aurora',
      unlocks: ['skin.cards.aurora'],
      accessibility: {
        ...result.current.state.accessibility,
        highContrast: true,
      },
    };

    act(() => {
      result.current.hydrateFromProfile(remotePayload);
      result.current.setSyncStatus('synced', null);
    });

    expect(result.current.state.cardSkinId).toBe('aurora');
    expect(result.current.state.accessibility.highContrast).toBe(true);
    expect(result.current.syncState.status).toBe('synced');
    expect(result.current.unlocks).toContain('skin.cards.aurora');
  });

  it('applies engine defaults when provided', async () => {
    const { result } = renderHook(() => useCustomization(), { wrapper });

    await act(async () => {
      result.current.unlockItems([
        'skin.cards.aurora',
        'skin.table.aurora-veil',
        'skin.pieces.aurora',
        'backdrop.aurora-sky',
      ]);
    });

    await act(async () => {
      result.current.applyPreset('midnight-classic', { force: true });
    });

    await act(async () => {
      result.current.setEngineDefaults('hearts', { presetId: 'aurora-bloom' }, { apply: true });
    });

    await waitFor(() => {
      expect(result.current.state.presetId).toBe('aurora-bloom');
      expect(result.current.state.themeId).toBe('aurora');
    });
  });
});
