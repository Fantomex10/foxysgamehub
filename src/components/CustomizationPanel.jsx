import React from 'react';
import { useCustomization, useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import { useTheme } from '../ui/ThemeContext.jsx';
import CustomizationPreview from './customization/CustomizationPreview.jsx';
import OptionSection from './customization/OptionSection.jsx';
import AccessibilityToggleGroup from './customization/AccessibilityToggleGroup.jsx';
import useCustomizationOptionStyles from './customization/useCustomizationOptionStyles.js';
import { listCustomizationCategories } from '../customization/categoriesRegistry.js';

const CustomizationPanel = () => {
  const {
    state,
    available,
    unlockItem,
    unlockItems,
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
    cards,
    cardSkin,
    table,
    tableSkin,
    pieces,
    pieceSkin,
    backdrop,
    accessibility,
    presetId,
    scaleFont,
    motionDuration,
  } = useCustomizationTokens();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.panel,
    width: '100%',
    maxWidth: '420px',
    boxSizing: 'border-box',
  };

  const {
    optionButtonStyle,
    unlockButtonStyle,
    toggleButtonStyle,
    sectionHeaderStyle,
    optionGridStyle,
  } = useCustomizationOptionStyles({
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  });

  const resetButtonStyle = {
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSoft}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    padding: '10px 12px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  };

  const unlockAndSelect = (item, setter) => {
    if (!item.unlockId) {
      setter(item.id);
      return;
    }
    const unlocked = !item.locked || unlockItem(item.unlockId);
    if (unlocked) {
      setter(item.id, { force: true });
    }
  };

  const unlockPresetRequirements = (preset) => {
    if (!Array.isArray(preset.requiredUnlocks) || preset.requiredUnlocks.length === 0) {
      applyPreset(preset.id, { force: true });
      return;
    }
    const unlocked = unlockItems(preset.requiredUnlocks);
    if (unlocked || !preset.locked) {
      applyPreset(preset.id, { force: true });
    }
  };

  const actions = {
    applyPreset: (presetId, options) => applyPreset(presetId, options),
    unlockPreset: (preset) => unlockPresetRequirements(preset),
    setThemeId,
    setCardSkin: (id, options) => setCardSkin(id, options),
    setTableSkin: (id, options) => setTableSkin(id, options),
    setPieceSkin: (id, options) => setPieceSkin(id, options),
    setBackdrop: (id, options) => setBackdrop(id, options),
    unlockAndSelect: (item, setter) => unlockAndSelect(item, setter),
  };

  const categoryContext = {
    state,
    available,
    actions,
    themeContext: { availableThemes },
  };

  const sections = listCustomizationCategories()
    .map((category) => category.buildSection(categoryContext))
    .filter(Boolean);

  return (
    <aside style={containerStyle}>
      <CustomizationPreview
        theme={theme}
        cards={cards}
        cardSkin={cardSkin}
        table={table}
        tableSkin={tableSkin}
        pieces={pieces}
        pieceSkin={pieceSkin}
        backdrop={backdrop}
        presetId={presetId}
        availablePresets={available.presets}
        scaleFont={scaleFont}
      />

      {sections.map((section) => (
        <OptionSection
          key={section.id ?? section.title}
          title={section.title}
          items={section.items}
          isActive={section.isActive}
          onSelect={section.onSelect}
          onUnlock={section.onUnlock}
          renderDescription={section.renderDescription}
          optionButtonStyle={optionButtonStyle}
          unlockButtonStyle={unlockButtonStyle}
          sectionHeaderStyle={sectionHeaderStyle}
          optionGridStyle={optionGridStyle}
          scaleFont={scaleFont}
          theme={theme}
        />
      ))}

      <AccessibilityToggleGroup
        accessibility={accessibility}
        onToggle={toggleAccessibility}
        toggleButtonStyle={toggleButtonStyle}
        scaleFont={scaleFont}
        theme={theme}
      />

      <button type="button" onClick={reset} style={resetButtonStyle}>
        Reset to theme defaults
      </button>
    </aside>
  );
};

export default CustomizationPanel;
