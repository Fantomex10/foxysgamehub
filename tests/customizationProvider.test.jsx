import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { CustomizationProvider, useCustomization, useCustomizationTokens } from '../src/customization/CustomizationContext.jsx';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { cardSkins } from '../src/customization/skins/cards.js';

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
});
