import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import LoginHub from '../src/components/LoginHub.jsx';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { useCustomization } from '../src/customization/useCustomization.js';

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

const AccessibilityHarness = () => {
  const { toggleAccessibility } = useCustomization();

  return (
    <>
      <button type="button" onClick={() => toggleAccessibility('largeText')}>
        Toggle large text
      </button>
      <LoginHub defaultName="Player" onSubmit={() => {}} />
    </>
  );
};

const renderLogin = () => render(
  <ThemeProvider>
    <CustomizationProvider>
      <AccessibilityHarness />
    </CustomizationProvider>
  </ThemeProvider>,
);

describe('LoginHub customization integration', () => {
  let restoreStorage;

  beforeEach(() => {
    restoreStorage = attachMockStorage();
  });

  afterEach(() => {
    restoreStorage?.();
  });

  it('scales button typography when large text is enabled', async () => {
    renderLogin();

    const loginButton = screen.getByRole('button', { name: /^Login$/i });
    expect(loginButton.style.fontSize).toBe('16px');

    fireEvent.click(screen.getByRole('button', { name: /toggle large text/i }));

    await waitFor(() => {
      expect(loginButton.style.fontSize).toBe('18.4px');
    });
  });
});


