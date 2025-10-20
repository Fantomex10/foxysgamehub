import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StatusControl } from '../src/components/lobby/StatusControl.jsx';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';

const STORAGE_KEY = 'fgb.customization';

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

const renderWithProviders = (ui) => render(
  <ThemeProvider>
    <CustomizationProvider>{ui}</CustomizationProvider>
  </ThemeProvider>,
);

describe('StatusControl accessibility integration', () => {
  let restoreStorage;

  beforeEach(() => {
    restoreStorage = attachMockStorage();
    window.localStorage.clear();
  });

  afterEach(() => {
    restoreStorage?.();
    document.documentElement.classList.remove('fgb-high-contrast', 'fgb-large-text', 'fgb-reduced-motion');
  });

  const seedCustomizationState = (overrides) => {
    const baseState = {
      themeId: 'midnight',
      cardSkinId: 'classic',
      tableSkinId: 'emerald-club',
      pieceSkinId: 'classic',
      backdropId: 'nebula-night',
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...baseState, ...overrides }));
  };

  it('scales control dimensions when large text mode is active', () => {
    seedCustomizationState({
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: true,
      },
    });

    const { getByRole } = renderWithProviders(
      <StatusControl status="ready" interactive onSelect={() => {}} playerName="Casey" />,
    );

    const controlButton = getByRole('button', { name: /change status for casey/i });
    expect(parseFloat(controlButton.style.height)).toBeCloseTo(32.2, 1);
    expect(controlButton.style.padding).not.toBe('');
  });

  it('disables transitions when reduced motion is enabled', () => {
    seedCustomizationState({
      accessibility: {
        highContrast: false,
        reducedMotion: true,
        largeText: false,
      },
    });

    const { getByRole } = renderWithProviders(
      <StatusControl status="ready" interactive onSelect={() => {}} playerName="Casey" />,
    );

    const controlButton = getByRole('button', { name: /change status for casey/i });
    expect(controlButton.style.transition).toBe('none');
  });
});
