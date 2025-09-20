import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../ui/ThemeContext.jsx';
import { defaultThemeId, getThemeById } from '../ui/theme.js';
import {
  defaultCardSkinId,
  getCardSkinById,
  listCardSkins,
} from './skins/cards.js';
import {
  defaultTableSkinId,
  getTableSkinById,
  listTableSkins,
} from './skins/table.js';
import {
  defaultPieceSkinId,
  getPieceSkinById,
  listPieceSkins,
} from './skins/pieces.js';
import {
  defaultBackdropId,
  getBackdropById,
  listBackdrops,
} from './backdrops.js';
import {
  defaultPresetId,
  getPresetById,
  listPresets,
} from './presets.js';

const STORAGE_KEY = 'fgb.customization';

const CustomizationContext = createContext(null);

const defaultAccessibility = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
};

const ensureAccessibility = (value = {}) => ({
  highContrast: Boolean(value.highContrast),
  reducedMotion: Boolean(value.reducedMotion),
  largeText: Boolean(value.largeText),
});

const readStoredState = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('[Customization] Failed to read stored state', error);
    return null;
  }
};

const writeStoredState = (state) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[Customization] Failed to persist state', error);
  }
};

const createSuggestedState = (themeId) => {
  const theme = getThemeById(themeId ?? defaultThemeId);
  const suggestions = theme.customization ?? {};
  return {
    themeId: theme.id,
    presetId: suggestions.suggestedPresetId ?? null,
    cardSkinId: suggestions.suggestedCardSkinId ?? defaultCardSkinId,
    tableSkinId: suggestions.suggestedTableSkinId ?? defaultTableSkinId,
    pieceSkinId: suggestions.suggestedPieceSkinId ?? defaultPieceSkinId,
    backdropId: suggestions.suggestedBackdropId ?? defaultBackdropId,
    accessibility: ensureAccessibility(suggestions.accessibility ?? defaultAccessibility),
  };
};

const sanitiseState = (input = {}, fallbackThemeId) => {
  const theme = getThemeById(input.themeId ?? fallbackThemeId ?? defaultThemeId);
  const themeId = theme.id;
  const cardSkinId = getCardSkinById(input.cardSkinId)?.id ?? defaultCardSkinId;
  const tableSkinId = getTableSkinById(input.tableSkinId)?.id ?? defaultTableSkinId;
  const pieceSkinId = getPieceSkinById(input.pieceSkinId)?.id ?? defaultPieceSkinId;
  const backdropId = getBackdropById(input.backdropId)?.id ?? defaultBackdropId;

  const preset = input.presetId ? getPresetById(input.presetId) : null;
  const presetId = preset && (!preset.themeId || preset.themeId === themeId) ? preset.id : null;

  return {
    themeId,
    presetId,
    cardSkinId,
    tableSkinId,
    pieceSkinId,
    backdropId,
    accessibility: ensureAccessibility(input.accessibility ?? defaultAccessibility),
  };
};

export const CustomizationProvider = ({ children }) => {
  const {
    themeId: activeThemeId,
    setThemeId: setThemeFromContext,
  } = useTheme();

  const initialState = useMemo(() => {
    const stored = readStoredState();
    if (stored) {
      return sanitiseState(stored, activeThemeId ?? defaultThemeId);
    }
    return sanitiseState(createSuggestedState(activeThemeId ?? defaultThemeId), activeThemeId);
  }, [activeThemeId]);

  const [state, setState] = useState(initialState);

  useEffect(() => {
    writeStoredState(state);
  }, [state]);

  useEffect(() => {
    if (!activeThemeId) {
      return;
    }
    setState((current) => {
      if (current.themeId === activeThemeId) {
        return current;
      }
      return sanitiseState({ ...current, themeId: activeThemeId }, activeThemeId);
    });
  }, [activeThemeId]);

  const availableOptions = useMemo(
    () => ({
      presets: listPresets(),
      cardSkins: listCardSkins(),
      tableSkins: listTableSkins(),
      pieceSkins: listPieceSkins(),
      backdrops: listBackdrops(),
    }),
    [],
  );

  const setThemeId = useCallback((nextThemeId) => {
    if (!nextThemeId) return;
    setThemeFromContext(nextThemeId);
    setState((current) => {
      if (current.themeId === nextThemeId) {
        return current;
      }
      return sanitiseState({ ...current, themeId: nextThemeId, presetId: null }, nextThemeId);
    });
  }, [setThemeFromContext]);

  const setCardSkin = useCallback((cardSkinId) => {
    setState((current) => sanitiseState({ ...current, cardSkinId, presetId: null }, current.themeId));
  }, []);

  const setTableSkin = useCallback((tableSkinId) => {
    setState((current) => sanitiseState({ ...current, tableSkinId, presetId: null }, current.themeId));
  }, []);

  const setPieceSkin = useCallback((pieceSkinId) => {
    setState((current) => sanitiseState({ ...current, pieceSkinId, presetId: null }, current.themeId));
  }, []);

  const setBackdrop = useCallback((backdropId) => {
    setState((current) => sanitiseState({ ...current, backdropId, presetId: null }, current.themeId));
  }, []);

  const toggleAccessibility = useCallback((flag) => {
    setState((current) => {
      if (!(flag in defaultAccessibility)) {
        return current;
      }
      const nextAccessibility = {
        ...current.accessibility,
        [flag]: !current.accessibility?.[flag],
      };
      return sanitiseState({ ...current, accessibility: nextAccessibility, presetId: null }, current.themeId);
    });
  }, []);

  const applyPreset = useCallback((presetId) => {
    const preset = getPresetById(presetId);
    if (!preset) return;
    const targetThemeId = preset.themeId ?? state.themeId ?? defaultThemeId;
    if (preset.themeId && preset.themeId !== state.themeId) {
      setThemeFromContext(preset.themeId);
    }
    setState((current) => {
      const nextThemeId = preset.themeId ?? current.themeId;
      const next = {
        ...current,
        themeId: nextThemeId,
        presetId: preset.id,
        cardSkinId: preset.cardSkinId ?? current.cardSkinId,
        tableSkinId: preset.tableSkinId ?? current.tableSkinId,
        pieceSkinId: preset.pieceSkinId ?? current.pieceSkinId,
        backdropId: preset.backdropId ?? current.backdropId,
      };
      if (preset.accessibility) {
        next.accessibility = {
          ...current.accessibility,
          ...preset.accessibility,
        };
      }
      return sanitiseState(next, nextThemeId);
    });
  }, [setThemeFromContext, state.themeId]);

  const reset = useCallback(() => {
    setState((current) => sanitiseState(createSuggestedState(current.themeId), current.themeId));
  }, []);

  const contextValue = useMemo(() => ({
    state,
    available: availableOptions,
    setThemeId,
    setCardSkin,
    setTableSkin,
    setPieceSkin,
    setBackdrop,
    toggleAccessibility,
    applyPreset,
    reset,
  }), [
    state,
    availableOptions,
    setThemeId,
    setCardSkin,
    setTableSkin,
    setPieceSkin,
    setBackdrop,
    toggleAccessibility,
    applyPreset,
    reset,
  ]);

  return (
    <CustomizationContext.Provider value={contextValue}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

export const useCustomizationTokens = () => {
  const { state } = useCustomization();
  const { theme } = useTheme();

  const cardSkin = useMemo(
    () => getCardSkinById(state.cardSkinId),
    [state.cardSkinId],
  );

  const tableSkin = useMemo(
    () => getTableSkinById(state.tableSkinId),
    [state.tableSkinId],
  );

  const pieceSkin = useMemo(
    () => getPieceSkinById(state.pieceSkinId),
    [state.pieceSkinId],
  );

  const backdrop = useMemo(
    () => getBackdropById(state.backdropId),
    [state.backdropId],
  );

  const cards = useMemo(
    () => ({
      ...(theme.cards ?? {}),
      ...(cardSkin.tokens ?? {}),
    }),
    [theme, cardSkin],
  );

  const table = useMemo(
    () => ({
      ...(theme.table ?? {}),
      ...(tableSkin.tokens ?? {}),
    }),
    [theme, tableSkin],
  );

  return {
    theme,
    cards,
    cardSkin,
    table,
    tableSkin,
    pieces: pieceSkin.tokens ?? {},
    pieceSkin,
    backdrop,
    accessibility: state.accessibility,
    presetId: state.presetId,
  };
};

export const defaultPreset = getPresetById(defaultPresetId);
