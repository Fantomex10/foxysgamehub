import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import CustomizationPanel from '../src/components/CustomizationPanel.jsx';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';

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

const renderPanel = () => (
  render(
    <ThemeProvider>
      <CustomizationProvider>
        <CustomizationPanel />
      </CustomizationProvider>
    </ThemeProvider>,
  )
);

describe('CustomizationPanel', () => {
  let restoreStorage;

  beforeEach(() => {
    restoreStorage = attachMockStorage();
  });

  afterEach(() => {
    restoreStorage?.();
  });

  it('unlocks and activates preset buttons', async () => {
    renderPanel();

    const presetsSection = screen.getByRole('heading', { name: /Presets/i }).closest('section');
    const presetWrapper = within(presetsSection).getAllByRole('button', { name: /Aurora Bloom/i })[0].parentElement;
    const presetButton = within(presetWrapper).getByRole('button', { name: /Aurora Bloom/i });

    expect(presetButton.hasAttribute('disabled')).toBe(true);

    const unlockButton = within(presetWrapper).getAllByRole('button', { name: /Unlock/i })[0];

    await fireEvent.click(unlockButton);

    await waitFor(() => {
      const buttons = within(presetsSection)
        .getAllByRole('button', { name: /Aurora Bloom/i })
        .filter((btn) => !btn.hasAttribute('disabled'));
      expect(buttons.length).toBeGreaterThan(0);
    });

    const unlockedButton = within(presetsSection)
      .getAllByRole('button', { name: /Aurora Bloom/i })
      .find((btn) => !btn.hasAttribute('disabled'));

    expect(unlockedButton).toBeTruthy();

    fireEvent.click(unlockedButton);

    await waitFor(() => {
      expect(unlockedButton?.getAttribute('data-active')).toBe('true');
    });
  });

  it('toggles accessibility options', () => {
    renderPanel();

    const highContrast = screen.getByRole('button', { name: /High contrast/i });

    fireEvent.click(highContrast);

    expect(highContrast.getAttribute('data-active')).toBe('true');
  });
});
