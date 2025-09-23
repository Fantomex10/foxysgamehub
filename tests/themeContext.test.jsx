import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from '../src/ui/ThemeContext.jsx';
import { defaultThemeId, getThemeById, listThemes } from '../src/ui/theme.js';

const wrapper = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  it('provides the default theme when mounted', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.themeId).toBe(defaultThemeId);
    expect(result.current.theme).toBe(getThemeById(defaultThemeId));
  });

  it('updates the theme id and persists selection', () => {
    const availableThemeIds = listThemes().map((theme) => theme.id);
    const nextThemeId = availableThemeIds.find((id) => id !== defaultThemeId) ?? defaultThemeId;
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeId(nextThemeId);
    });

    expect(result.current.themeId).toBe(nextThemeId);
    expect(result.current.theme).toBe(getThemeById(nextThemeId));
  });
});
