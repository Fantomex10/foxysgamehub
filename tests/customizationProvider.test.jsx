import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';
import { useCustomization, useCustomizationTokens } from '../src/customization/useCustomization.js';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { cardSkins, defaultCardSkinId } from '../src/customization/skins/cards.js';
import { defaultTableSkinId } from '../src/customization/skins/table.js';
import { defaultPieceSkinId } from '../src/customization/skins/pieces.js';
import { defaultBackdropId } from '../src/customization/backdrops.js';
import { defaultThemeId } from '../src/ui/theme.js';

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
    document.documentElement.classList.remove('fgb-high-contrast', 'fgb-large-text', 'fgb-reduced-motion');
  });

  it('applies presets and accessibility toggles', () => {
    const { result } = renderHook(() => useCustomization(), { wrapper });

    act(() => {
      result.current.applyPreset('aurora-bloom');
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
      result.current.api.setCardSkin('aurora');
    });

    expect(result.current.tokens.cards.accent).toBe(cardSkins.aurora.tokens.accent);
  });

  it('falls back to defaults when stored registry IDs are invalid', () => {
    window.localStorage.setItem('fgb.customization', JSON.stringify({
      themeId: 'unknown-theme',
      cardSkinId: 'missing-card',
      tableSkinId: 'missing-table',
      pieceSkinId: 'missing-piece',
      backdropId: 'missing-backdrop',
      accessibility: {
        highContrast: true,
        reducedMotion: true,
        largeText: true,
      },
    }));

    const { result } = renderHook(() => useCustomization(), { wrapper });

    expect(result.current.state.themeId).toBe(defaultThemeId);
    expect(result.current.state.cardSkinId).toBe(defaultCardSkinId);
    expect(result.current.state.tableSkinId).toBe(defaultTableSkinId);
    expect(result.current.state.pieceSkinId).toBe(defaultPieceSkinId);
    expect(result.current.state.backdropId).toBe(defaultBackdropId);
    expect(result.current.state.accessibility.reducedMotion).toBe(true);
    expect(result.current.state.accessibility.largeText).toBe(true);
    expect(result.current.state.accessibility.highContrast).toBe(true);
  });

  it('syncs accessibility classes on the document element', () => {
    const { result } = renderHook(() => useCustomization(), { wrapper });
    const root = document.documentElement;

    expect(root.classList.contains('fgb-high-contrast')).toBe(false);

    act(() => {
      result.current.toggleAccessibility('highContrast');
    });

    expect(root.classList.contains('fgb-high-contrast')).toBe(true);

    act(() => {
      result.current.toggleAccessibility('highContrast');
    });

    expect(root.classList.contains('fgb-high-contrast')).toBe(false);
  });
});
