import React, { useMemo } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';
import { useCustomizationTokens } from '../src/customization/useCustomization.js';
import { getSeatManagerStyles } from '../src/components/lobby/seatManager/seatManagerStyles.js';
import { SeatList } from '../src/components/lobby/seatManager/SeatList.jsx';
import { BenchList } from '../src/components/lobby/seatManager/BenchList.jsx';

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

const withProviders = (node) =>
  render(
    <ThemeProvider>
      <CustomizationProvider>{node}</CustomizationProvider>
    </ThemeProvider>,
  );

const SeatListHarness = ({ children }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const styles = useMemo(
    () => getSeatManagerStyles({ theme, fontScale }),
    [theme, fontScale],
  );
  return children(styles);
};

describe('Seat manager components', () => {
  let restoreStorage;

  beforeEach(() => {
    restoreStorage = attachMockStorage();
    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  });

  afterEach(() => {
    if (restoreStorage) restoreStorage();
  });

  it('allows benching and reordering seated players', () => {
    const onBench = vi.fn();
    const onReorder = vi.fn();
    const participants = new Map([
      ['host', { id: 'host', name: 'Host', isHost: true }],
      ['p2', { id: 'p2', name: 'Player 2' }],
    ]);

    withProviders(
      <SeatListHarness>
        {(styles) => (
          <SeatList
            seatIds={['host', 'p2']}
            participants={participants}
            userId="host"
            hostId="host"
            canManageSeats
            seatCount={4}
            styles={styles}
            onBench={onBench}
            onReorder={onReorder}
          />
        )}
      </SeatListHarness>,
    );

    const moveDownButtons = screen.getAllByRole('button', { name: 'Move down' });
    fireEvent.click(moveDownButtons[0]);
    expect(onReorder).toHaveBeenCalledWith('host', 'down');

    const moveUpButtons = screen.getAllByRole('button', { name: 'Move up' });
    fireEvent.click(moveUpButtons[1]);
    expect(onReorder).toHaveBeenCalledWith('p2', 'up');

    fireEvent.click(screen.getByRole('button', { name: 'Bench' }));
    expect(onBench).toHaveBeenCalledWith('p2');
  });

  it('allows seating and kicking from bench', () => {
    const onSeat = vi.fn();
    const onKick = vi.fn();
    const participants = new Map([
      ['p3', { id: 'p3', name: 'Player 3' }],
    ]);

    withProviders(
      <SeatListHarness>
        {(styles) => (
          <BenchList
            benchIds={['p3']}
            participants={participants}
            userId="host"
            hostId="host"
            canManageSeats
            seatsFull={false}
            styles={styles}
            onSeat={onSeat}
            onKick={onKick}
          />
        )}
      </SeatListHarness>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Seat' }));
    expect(onSeat).toHaveBeenCalledWith('p3');

    fireEvent.click(screen.getByRole('button', { name: 'Kick' }));
    expect(onKick).toHaveBeenCalledWith('p3');
  });
});
