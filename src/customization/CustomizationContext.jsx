import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../ui/useTheme.js';
import { CustomizationContext } from './customizationContext.js';
import {
  createSuggestedState,
  defaultAccessibility,
  sanitiseState,
} from './customizationState.js';
import { listCardSkins } from './skins/cards.js';
import { listTableSkins } from './skins/table.js';
import { listPieceSkins } from './skins/pieces.js';
import { listBackdrops } from './backdrops.js';
import { getPresetById, listPresets } from './presets.js';

const STORAGE_KEY = 'fgb.customization';

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

export const CustomizationProvider = ({ children }) => {
  const {
    themeId: activeThemeId,
    setThemeId: setThemeFromContext,
  } = useTheme();

  const initialState = useMemo(() => {
    const stored = readStoredState();
    if (stored) {
      return sanitiseState(stored, activeThemeId);
    }
    return sanitiseState(createSuggestedState(activeThemeId), activeThemeId);
  }, [activeThemeId]);

  const [state, setState] = useState(initialState);

  useEffect(() => {
    writeStoredState(state);
  }, [state]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return () => {};
    }
    const root = document.documentElement;
    const accessibility = state.accessibility ?? defaultAccessibility;

    root.classList.toggle('fgb-high-contrast', Boolean(accessibility.highContrast));
    root.classList.toggle('fgb-large-text', Boolean(accessibility.largeText));
    root.classList.toggle('fgb-reduced-motion', Boolean(accessibility.reducedMotion));

    return () => {
      root.classList.remove('fgb-high-contrast', 'fgb-large-text', 'fgb-reduced-motion');
    };
  }, [state.accessibility]);

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
