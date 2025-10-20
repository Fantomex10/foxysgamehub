import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('activates preset buttons', () => {
    renderPanel();

    const [auroraButton] = screen.getAllByRole('button', { name: /Aurora Bloom/i });

    fireEvent.click(auroraButton);

    expect(auroraButton.getAttribute('data-active')).toBe('true');
  });

  it('toggles accessibility options', () => {
    renderPanel();

    const highContrast = screen.getByRole('button', { name: /High contrast/i });

    fireEvent.click(highContrast);

    expect(highContrast.getAttribute('data-active')).toBe('true');
  });
});
