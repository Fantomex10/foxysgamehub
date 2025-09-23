/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultTheme, defaultThemeId, getThemeById, listThemes } from './theme.js';

const STORAGE_KEY = 'fgb.theme';

const ThemeContext = createContext({
  theme: defaultTheme,
  themeId: defaultThemeId,
  availableThemes: [],
  setThemeId: () => {},
});

const readStoredThemeId = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return typeof stored === 'string' && stored.length > 0 ? stored : null;
  } catch (error) {
    console.warn('[Theme] Failed to read stored theme id', error);
    return null;
  }
};

const writeStoredThemeId = (themeId) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, themeId);
  } catch (error) {
    console.warn('[Theme] Failed to persist theme id', error);
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeIdState] = useState(() => readStoredThemeId() ?? defaultThemeId);

  const setThemeId = useCallback((nextId) => {
    setThemeIdState((current) => {
      if (!nextId || nextId === current) {
        return current;
      }
      const candidate = getThemeById(nextId).id;
      writeStoredThemeId(candidate);
      return candidate;
    });
  }, []);

  useEffect(() => {
    // Ensure stored theme is valid even if defaults change.
    const stored = readStoredThemeId();
    if (stored && stored !== themeId) {
      setThemeId(stored);
    }
  }, [themeId, setThemeId]);

  const availableThemes = useMemo(
    () => listThemes().map(({ id, name }) => ({ id, name })),
    [],
  );

  const contextValue = useMemo(
    () => ({
      themeId,
      theme: getThemeById(themeId),
      availableThemes,
      setThemeId,
    }),
    [themeId, availableThemes, setThemeId],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
