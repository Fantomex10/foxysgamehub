/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useCustomizationStateMachine, defaultPreset } from './useCustomizationStateMachine.js';
import { useTheme } from '../ui/ThemeContext.jsx';
import {
  getCardSkinById,
} from './skins/cards.js';
import {
  getTableSkinById,
} from './skins/table.js';
import {
  getPieceSkinById,
} from './skins/pieces.js';
import {
  getBackdropById,
} from './backdrops.js';

const CustomizationContext = createContext(null);

export const CustomizationProvider = ({ children }) => {
  const value = useCustomizationStateMachine();
  return (
    <CustomizationContext.Provider value={value}>
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
      ...(cardSkin?.tokens ?? {}),
    }),
    [theme, cardSkin],
  );

  const table = useMemo(
    () => ({
      ...(theme.table ?? {}),
      ...(tableSkin?.tokens ?? {}),
    }),
    [theme, tableSkin],
  );

  const scaleFont = useCallback(
    (value) => {
      if (!state.accessibility?.largeText || typeof value !== 'string') {
        return value;
      }
      const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
      if (!match) {
        return value;
      }
      const numeric = Number.parseFloat(match[1]);
      if (Number.isNaN(numeric)) {
        return value;
      }
      const scaled = Math.round(numeric * 1.12 * 10) / 10;
      return `${scaled}px`;
    },
    [state.accessibility?.largeText],
  );

  const motionDuration = useCallback(
    (value) => {
      if (!state.accessibility?.reducedMotion || !value) {
        return value;
      }
      return '0ms';
    },
    [state.accessibility?.reducedMotion],
  );

  return {
    theme,
    cards,
    cardSkin,
    table,
    tableSkin,
    pieces: pieceSkin?.tokens ?? {},
    pieceSkin,
    backdrop,
    accessibility: state.accessibility,
    presetId: state.presetId,
    scaleFont,
    motionDuration,
  };
};

export { defaultPreset };
