import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';
import { useCustomizationTokens } from '../src/customization/useCustomization.js';
import { LobbyActionGrid } from '../src/components/lobby/LobbyActionGrid.jsx';
import { LobbyHeader } from '../src/components/lobby/LobbyHeader.jsx';
import { SeatManagerSummary } from '../src/components/lobby/SeatManagerSummary.jsx';

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

const renderWithProviders = (ui) =>
  render(
    <ThemeProvider>
      <CustomizationProvider>{ui}</CustomizationProvider>
    </ThemeProvider>,
  );

const ThemedGrid = (props) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = Boolean(accessibility?.prefersReducedMotion);
  return (
    <LobbyActionGrid
      {...props}
      theme={theme}
      fontScale={fontScale}
      prefersReducedMotion={prefersReducedMotion}
    />
  );
};

describe('Lobby components', () => {
  let restoreStorage;

  beforeEach(() => {
    restoreStorage = attachMockStorage();
    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  });

  afterEach(() => {
    if (restoreStorage) restoreStorage();
  });

  it('renders lobby action buttons and handles click', () => {
    const onReady = vi.fn();
    renderWithProviders(
      <ThemedGrid
        actions={[{ key: 'ready', label: 'Ready', onClick: onReady, disabled: false }]}
        columns={4}
        isCompact={false}
      />,
    );

    const button = screen.getByRole('button', { name: 'Ready' });
    fireEvent.click(button);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('shows player counts and propagates game selection', () => {
    const onSelectGame = vi.fn();
    renderWithProviders(
      <LobbyHeader
        playerCount={2}
        seatCapacity={4}
        isCompact={false}
        gameSelectId="test-game-select"
        gameOptions={[
          { id: 'crazy', name: 'Crazy Eights' },
          { id: 'hearts', name: 'Hearts' },
        ]}
        currentGameId="crazy"
        showGameSelect
        onSelectGame={onSelectGame}
      />,
    );

    expect(screen.getByText('2/4')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Select game'), { target: { value: 'hearts' } });
    expect(onSelectGame).toHaveBeenCalledWith('hearts');
  });

  it('describes seat manager state', () => {
    renderWithProviders(
      <SeatManagerSummary
        seatCapacity={4}
        players={[{ id: 'host' }, { id: 'p2' }]}
        benchList={[{ id: 'spectator' }]}
        seatManagerEnabled={true}
      />,
    );

    expect(screen.getByText(/Seats filled:/)).toBeTruthy();
    expect(screen.getByText(/Seat manager ready/)).toBeTruthy();
    expect(screen.getByText(/Bench 1/)).toBeTruthy();
  });
});
