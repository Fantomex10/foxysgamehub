import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HubMenu from '../src/components/HubMenu.jsx';
import { CustomizationProvider } from '../src/customization/CustomizationContext.jsx';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';

const withProviders = (ui) => (
  <ThemeProvider>
    <CustomizationProvider>{ui}</CustomizationProvider>
  </ThemeProvider>
);

describe('HubMenu', () => {
  it('renders all menu buttons and triggers provided handlers', () => {
    const onCreate = vi.fn();

    render(withProviders(<HubMenu onCreate={onCreate} />));

    expect(screen.getAllByRole('button')).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: /create lobby/i }));
    expect(onCreate).toHaveBeenCalled();
  });

  it('falls back to modal messaging when handler is missing', () => {
    render(withProviders(<HubMenu />));

    fireEvent.click(screen.getByRole('button', { name: /enter daily draw/i }));

    expect(screen.queryByText(/daily draw rewards will unlock soon/i)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /ok/i }));

    expect(screen.queryByText(/daily draw rewards will unlock soon/i)).toBeNull();
  });
});
