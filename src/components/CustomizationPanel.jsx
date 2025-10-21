import React, { useMemo } from 'react';
import { useCustomization, useCustomizationTokens } from '../customization/useCustomization.js';
import { useTheme } from '../ui/useTheme.js';
import { scaleFont } from '../ui/typography.js';

const noop = () => {};

const CustomizationPanel = ({
  isOpen = false,
  activeCategory = null,
  onSelectCategory = noop,
  onBackToRoot = noop,
  onClose = noop,
}) => {
  const {
    state,
    available,
    setThemeId,
    setCardSkin,
    setTableSkin,
    setPieceSkin,
    setBackdrop,
    toggleAccessibility,
    applyPreset,
    reset,
  } = useCustomization();
  const { availableThemes } = useTheme();
  const {
    theme,
    cardSkin,
    tableSkin,
    pieceSkin,
    backdrop,
    accessibility,
    presetId,
  } = useCustomizationTokens();

  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;

  const { presets, cardSkins, tableSkins, pieceSkins, backdrops } = available;

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === presetId) ?? null,
    [presets, presetId],
  );

  const themeName = useMemo(() => {
    const match = availableThemes.find((entry) => entry.id === state.themeId);
    return match?.name ?? 'Default theme';
  }, [availableThemes, state.themeId]);

  const accessibilityFlags = useMemo(() => ([
    accessibility?.highContrast ? 'High contrast' : null,
    accessibility?.largeText ? 'Large text' : null,
    accessibility?.reducedMotion ? 'Reduced motion' : null,
  ].filter(Boolean)), [accessibility]);

  const accessibilitySummary = accessibilityFlags.length > 0
    ? accessibilityFlags.join(', ')
    : 'Standard';

  const rootEntries = useMemo(() => ([
    {
      id: 'presets',
      label: 'Presets',
      summary: activePreset ? activePreset.name : 'Custom mix',
      description: 'Apply curated combinations from the Foxy team.',
    },
    {
      id: 'theme',
      label: 'Theme',
      summary: themeName,
      description: 'Change the overall interface palette.',
    },
    {
      id: 'cards',
      label: 'Card backs',
      summary: cardSkin?.name ?? 'Classic deck',
      description: 'Swap between deck styles and finishes.',
    },
    {
      id: 'table',
      label: 'Table felt',
      summary: tableSkin?.name ?? 'Emerald felt',
      description: 'Pick the felt and rails around the table.',
    },
    {
      id: 'pieces',
      label: 'Piece skins',
      summary: pieceSkin?.name ?? 'Classic tokens',
      description: 'Choose the look of player tokens.',
    },
    {
      id: 'backdrops',
      label: 'Backdrops',
      summary: backdrop?.name ?? 'Nebula night',
      description: 'Update the scene behind the table.',
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      summary: accessibilitySummary,
      description: 'Toggle contrast, text size, and motion options.',
    },
  ]), [
    activePreset,
    cardSkin,
    tableSkin,
    pieceSkin,
    backdrop,
    themeName,
    accessibilitySummary,
  ]);

  const categoryDetails = useMemo(() => ({
    presets: {
      title: 'Presets',
      description: 'Pick a curated combination of colors, skins, and backdrops.',
      options: presets.map((preset) => ({
        id: preset.id,
        label: preset.name,
        description: preset.description,
        active: preset.id === state.presetId,
        onSelect: () => applyPreset(preset.id),
      })),
    },
    theme: {
      title: 'Theme',
      description: 'Switch the primary interface palette.',
      options: availableThemes.map((entry) => ({
        id: entry.id,
        label: entry.name,
        active: entry.id === state.themeId,
        onSelect: () => setThemeId(entry.id),
      })),
    },
    cards: {
      title: 'Card backs',
      description: 'Change the look of the deck and accents.',
      options: cardSkins.map((skin) => ({
        id: skin.id,
        label: skin.name,
        description: skin.description,
        active: state.cardSkinId === skin.id,
        onSelect: () => setCardSkin(skin.id),
      })),
    },
    table: {
      title: 'Table felt',
      description: 'Adjust the felt color and table trim.',
      options: tableSkins.map((skin) => ({
        id: skin.id,
        label: skin.name,
        description: skin.description,
        active: state.tableSkinId === skin.id,
        onSelect: () => setTableSkin(skin.id),
      })),
    },
    pieces: {
      title: 'Piece skins',
      description: 'Choose the styling for player tokens and chips.',
      options: pieceSkins.map((skin) => ({
        id: skin.id,
        label: skin.name,
        description: skin.description,
        active: state.pieceSkinId === skin.id,
        onSelect: () => setPieceSkin(skin.id),
      })),
    },
    backdrops: {
      title: 'Backdrops',
      description: 'Update the background scene around the table.',
      options: backdrops.map((entry) => ({
        id: entry.id,
        label: entry.name,
        description: entry.description,
        active: state.backdropId === entry.id,
        onSelect: () => setBackdrop(entry.id),
      })),
    },
    accessibility: {
      title: 'Accessibility',
      description: 'Toggle enhancements for contrast, motion, and reading comfort.',
      options: [
        { id: 'highContrast', label: 'High contrast' },
        { id: 'largeText', label: 'Large text' },
        { id: 'reducedMotion', label: 'Reduced motion' },
      ].map((entry) => ({
        ...entry,
        active: Boolean(state.accessibility?.[entry.id]),
        onSelect: () => toggleAccessibility(entry.id),
        toggle: true,
      })),
    },
  }), [
    presets,
    state.presetId,
    applyPreset,
    availableThemes,
    state.themeId,
    setThemeId,
    cardSkins,
    state.cardSkinId,
    setCardSkin,
    tableSkins,
    state.tableSkinId,
    setTableSkin,
    pieceSkins,
    state.pieceSkinId,
    setPieceSkin,
    backdrops,
    state.backdropId,
    setBackdrop,
    state.accessibility,
    toggleAccessibility,
  ]);

  if (!isOpen) {
    return null;
  }

  const rootOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: theme.overlays.scrim,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 20,
  };

  const dialogStyle = {
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.lg,
    boxShadow: theme.shadows.panel,
    width: 'min(420px, 100%)',
    maxHeight: 'min(520px, 90vh)',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    padding: '20px',
    boxSizing: 'border-box',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    color: theme.colors.textPrimary,
  };

  const introStyle = {
    margin: 0,
    fontSize: scaleFont('14px', fontScale),
    color: theme.colors.textSecondary,
  };

  const categoryListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    overflowY: 'auto',
    paddingRight: '4px',
  };

  const categoryButtonStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    padding: '12px 14px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease, border-color 0.2s ease',
    textAlign: 'left',
  };

  const categoryTitleStyle = {
    fontSize: scaleFont('15px', fontScale),
    fontWeight: 600,
  };

  const categorySummaryStyle = {
    fontSize: scaleFont('13px', fontScale),
    color: theme.colors.textSecondary,
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  };

  const secondaryButtonStyle = {
    flex: '1 1 45%',
    padding: '10px 14px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    cursor: 'pointer',
    fontSize: scaleFont('14px', fontScale),
  };

  const primaryButtonStyle = {
    flex: '1 1 45%',
    padding: '10px 14px',
    borderRadius: theme.radii.md,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    cursor: 'pointer',
    fontSize: scaleFont('14px', fontScale),
    fontWeight: 600,
  };

  const categoryOverlayStyle = {
    ...rootOverlayStyle,
    zIndex: 24,
    background: 'transparent',
    pointerEvents: 'none',
  };

  const categoryDialogStyle = {
    ...dialogStyle,
    pointerEvents: 'auto',
    boxShadow: theme.shadows.popover ?? theme.shadows.panel,
  };

  const optionsListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    overflowY: 'auto',
    paddingRight: '4px',
  };

  const optionButtonStyle = (active) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: theme.radii.md,
    border: `1px solid ${active ? theme.colors.accentPrimary : theme.colors.border}`,
    background: active ? theme.colors.accentPrimarySoft : theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease, border-color 0.2s ease',
  });

  const optionLabelStyle = {
    fontSize: scaleFont('15px', fontScale),
    fontWeight: 600,
  };

  const optionDescriptionStyle = {
    fontSize: scaleFont('13px', fontScale),
    color: theme.colors.textSecondary,
  };

  const renderRoot = () => (
    <div style={rootOverlayStyle} role="dialog" aria-modal="true" aria-label="Customization menu">
      <div style={dialogStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: scaleFont('20px', fontScale) }}>Customization</h2>
          <p style={introStyle}>
            Tune the table, cards, and accessibility settings. Choose a section below to drill down.
          </p>
        </div>

        <div style={categoryListStyle}>
          {rootEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelectCategory(entry.id)}
              style={categoryButtonStyle}
            >
              <span style={categoryTitleStyle}>{entry.label}</span>
              <span style={categorySummaryStyle}>{entry.summary}</span>
              <span style={{ ...categorySummaryStyle, fontSize: scaleFont('12px', fontScale) }}>
                {entry.description}
              </span>
            </button>
          ))}
        </div>

        <div style={footerStyle}>
          <button type="button" onClick={reset} style={secondaryButtonStyle}>
            Reset defaults
          </button>
          <button type="button" onClick={onClose} style={primaryButtonStyle}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderCategory = () => {
    if (!activeCategory) {
      return null;
    }

    const descriptor = categoryDetails[activeCategory];
    if (!descriptor) {
      return null;
    }

    return (
      <div style={categoryOverlayStyle} role="dialog" aria-modal="true" aria-label={descriptor.title}>
        <div style={categoryDialogStyle}>
          <div style={headerStyle}>
            <h3 style={{ margin: 0, fontSize: scaleFont('18px', fontScale) }}>{descriptor.title}</h3>
            <p style={introStyle}>{descriptor.description}</p>
          </div>

          <div style={optionsListStyle}>
            {descriptor.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={option.onSelect}
                style={optionButtonStyle(option.active)}
                aria-pressed={option.toggle ? option.active : undefined}
                data-active={option.active}
              >
                <span style={optionLabelStyle}>{option.label}</span>
                {option.description && (
                  <span style={optionDescriptionStyle}>{option.description}</span>
                )}
              </button>
            ))}
          </div>

          <div style={footerStyle}>
            <button type="button" onClick={onBackToRoot} style={secondaryButtonStyle}>
              Back
            </button>
            <button type="button" onClick={onClose} style={primaryButtonStyle}>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderRoot()}
      {renderCategory()}
    </>
  );
};

export default CustomizationPanel;
