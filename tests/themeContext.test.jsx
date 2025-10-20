import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../src/ui/ThemeContext.jsx';
import { useTheme } from '../src/ui/useTheme.js';
import { defaultThemeId, themes } from '../src/ui/theme.js';

const wrapper = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  it('provides the default theme when mounted', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.themeId).toBe(defaultThemeId);
    expect(result.current.theme).toBe(themes[defaultThemeId]);
  });

  it('updates the theme id and persists selection', () => {
    const nextThemeId = Object.keys(themes).find((id) => id !== defaultThemeId) ?? defaultThemeId;
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeId(nextThemeId);
    });

    expect(result.current.themeId).toBe(nextThemeId);
    expect(result.current.theme).toBe(themes[nextThemeId]);
  });
});
