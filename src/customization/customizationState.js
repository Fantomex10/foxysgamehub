import { defaultThemeId, getThemeById } from '../ui/theme.js';
import {
  defaultCardSkinId,
  getCardSkinById,
} from './skins/cards.js';
import {
  defaultTableSkinId,
  getTableSkinById,
} from './skins/table.js';
import {
  defaultPieceSkinId,
  getPieceSkinById,
} from './skins/pieces.js';
import {
  defaultBackdropId,
  getBackdropById,
} from './backdrops.js';
import {
  defaultPresetId,
  getPresetById,
} from './presets.js';

export const defaultAccessibility = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
};

export const ensureAccessibility = (value = {}) => ({
  highContrast: Boolean(value.highContrast),
  reducedMotion: Boolean(value.reducedMotion),
  largeText: Boolean(value.largeText),
});

export const createSuggestedState = (themeId) => {
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

export const sanitiseState = (input = {}, fallbackThemeId) => {
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

export const applyHighContrast = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    surface: theme.colors.background,
    surfaceAlt: theme.colors.background,
    surfaceMuted: theme.colors.background,
    textPrimary: '#ffffff',
    textSecondary: '#f8fafc',
    textMuted: '#e2e8f0',
    border: theme.colors.accentPrimary,
    borderSoft: theme.colors.accentPrimary,
    borderStrong: theme.colors.accentPrimary,
  },
  buttons: {
    ...theme.buttons,
    subtleBg: 'rgba(255,255,255,0.12)',
    subtleText: '#ffffff',
    subtleBorder: theme.colors.accentPrimary,
    ghostBg: 'rgba(255,255,255,0.08)',
    ghostText: '#ffffff',
    primaryText: '#0f172a',
  },
});

export const deriveAccessibilityMeta = (accessibility) => ({
  fontScale: accessibility.largeText ? 1.15 : 1,
  prefersReducedMotion: Boolean(accessibility.reducedMotion),
});

export const defaultPreset = getPresetById(defaultPresetId);

