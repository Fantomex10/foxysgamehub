import { useContext, useMemo } from 'react';
import { useTheme } from '../ui/useTheme.js';
import { CustomizationContext } from './customizationContext.js';
import {
  applyHighContrast,
  defaultAccessibility,
  deriveAccessibilityMeta,
} from './customizationState.js';
import { getCardSkinById } from './skins/cards.js';
import { getTableSkinById } from './skins/table.js';
import { getPieceSkinById } from './skins/pieces.js';
import { getBackdropById } from './backdrops.js';

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

  const accessibility = state.accessibility ?? defaultAccessibility;
  const resolvedTheme = useMemo(
    () => (accessibility.highContrast ? applyHighContrast(theme) : theme),
    [theme, accessibility.highContrast],
  );

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
      ...(resolvedTheme.cards ?? {}),
      ...(cardSkin?.tokens ?? {}),
    }),
    [resolvedTheme, cardSkin],
  );

  const table = useMemo(
    () => ({
      ...(resolvedTheme.table ?? {}),
      ...(tableSkin?.tokens ?? {}),
    }),
    [resolvedTheme, tableSkin],
  );

  const accessibilityMeta = useMemo(
    () => ({
      ...accessibility,
      ...deriveAccessibilityMeta(accessibility),
    }),
    [accessibility],
  );

  return {
    theme: resolvedTheme,
    cards,
    cardSkin,
    table,
    tableSkin,
    pieces: pieceSkin?.tokens ?? {},
    pieceSkin,
    backdrop,
    accessibility: accessibilityMeta,
    presetId: state.presetId,
  };
};

