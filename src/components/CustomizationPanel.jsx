import React from 'react';
import { useCustomization, useCustomizationTokens } from '../customization/useCustomization.js';
import { useTheme } from '../ui/useTheme.js';
import { scaleFont } from '../ui/typography.js';

const maybeDisableTransition = (prefersReducedMotion, value) => (
  prefersReducedMotion ? 'none' : value
);

const CustomizationPanel = () => {
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
    cards,
    cardSkin,
    table,
    tableSkin,
    pieces,
    pieceSkin,
    backdrop,
    accessibility,
    presetId,
  } = useCustomizationTokens();

  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;
  const activePreset = available.presets.find((preset) => preset.id === presetId) ?? null;
  const activeAccessibility = [
    accessibility?.highContrast ? 'High contrast' : null,
    accessibility?.largeText ? 'Large text' : null,
    accessibility?.reducedMotion ? 'Reduced motion' : null,
  ].filter(Boolean);

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
    fontSize: scaleFont('14px', fontScale),
  };

  const previewShellStyle = {
    position: 'relative',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.borderSoft}`,
    background: backdrop.tokens?.background ?? theme.colors.surface,
    padding: theme.spacing.md,
    overflow: 'hidden',
    display: 'grid',
    gap: theme.spacing.sm,
  };

  const cardPreviewStyle = {
    width: '72px',
    height: '100px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${cards.border ?? theme.colors.cardBorder}`,
    background: cards.face,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: cards.text ?? theme.colors.textPrimary,
    fontWeight: 700,
    fontSize: scaleFont('22px', fontScale),
  };

  const feltPreviewStyle = {
    borderRadius: theme.radii.sm,
    border: `1px solid ${table.border ?? theme.colors.border}`,
    background: table.felt ?? theme.table?.felt ?? theme.colors.surfaceMuted,
    color: table.text ?? theme.colors.textPrimary,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: scaleFont('12px', fontScale),
    display: 'inline-flex',
    alignSelf: 'flex-start',
  };

  const piecePreviewWrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  };

  const piecePreviewStyle = {
    position: 'relative',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: pieces.primary ?? theme.colors.accentPrimary,
    boxShadow: `0 0 0 2px ${theme.colors.surface}`,
  };

  const pieceHighlightStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: pieces.highlight ?? theme.colors.accentPrimary,
    transform: 'translate(-50%, -50%)',
    boxShadow: `0 0 0 2px ${pieces.secondary ?? theme.colors.surfaceAlt}`,
    opacity: 0.9,
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };

  const sectionHeaderStyle = {
    margin: 0,
    fontSize: scaleFont('14px', fontScale),
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  };

  const optionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: theme.spacing.sm,
  };

  const optionButtonStyle = (active) => ({
    borderRadius: theme.radii.sm,
    border: `1px solid ${active ? theme.colors.accentPrimary : theme.colors.border}`,
    background: active ? theme.colors.accentPrimarySoft : theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: maybeDisableTransition(prefersReducedMotion, 'transform 0.2s ease, border-color 0.2s ease'),
    fontSize: scaleFont('13px', fontScale),
  });

  const toggleButtonStyle = (active) => ({
    borderRadius: theme.radii.sm,
    border: `1px solid ${active ? theme.colors.accentPrimary : theme.colors.border}`,
    background: active ? theme.colors.accentPrimarySoft : theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: scaleFont('14px', fontScale),
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

  return (
    <aside style={containerStyle}>
      <div style={previewShellStyle}>
        {backdrop.tokens?.overlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: backdrop.tokens.overlay,
            }}
          />
        )}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: scaleFont('18px', fontScale), color: theme.colors.textPrimary }}>Your style</h2>
              <p style={{ margin: '4px 0 0', fontSize: scaleFont('13px', fontScale), color: theme.colors.textSecondary }}>
                {cardSkin.name} / {tableSkin.name}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: scaleFont('12px', fontScale), color: theme.colors.textMuted }}>
              <span>Pieces: {pieceSkin.name}</span>
              <span>Backdrop: {backdrop.name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center', position: 'relative', flexWrap: 'wrap' }}>
            <div style={cardPreviewStyle}>AS</div>
            <span style={feltPreviewStyle}>Felt</span>
            <div style={piecePreviewWrapperStyle}>
              <div style={piecePreviewStyle}>
                <span style={pieceHighlightStyle} />
              </div>
              <span style={{ fontSize: scaleFont('12px', fontScale), color: theme.colors.textSecondary }}>Pieces</span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: theme.spacing.xs,
              justifyContent: 'space-between',
              fontSize: scaleFont('12px', fontScale),
              color: theme.colors.textMuted,
            }}
          >
            <span>Preset: {activePreset ? activePreset.name : 'Custom mix'}</span>
            <span>
              Accessibility: {activeAccessibility.length > 0 ? activeAccessibility.join(', ') : 'Default'}
            </span>
          </div>
        </div>
      </div>

      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>Presets</h3>
        <div style={optionGridStyle}>
          {available.presets.map((preset) => {
            const active = presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                style={optionButtonStyle(active)}
                aria-pressed={active}
                data-active={active}
              >
                <strong>{preset.name}</strong>
                <span style={{ fontSize: scaleFont('12px', fontScale), color: theme.colors.textSecondary }}>{preset.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>Themes</h3>
        <div style={optionGridStyle}>
          {availableThemes?.map((entry) => {
            const active = state.themeId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setThemeId(entry.id)}
                style={optionButtonStyle(active)}
                aria-pressed={active}
                data-active={active}
              >
                <strong>{entry.name}</strong>
                <span style={{ fontSize: scaleFont('12px', fontScale), color: theme.colors.textSecondary }}>Palette</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>Card backs</h3>
        <div style={optionGridStyle}>
          {available.cardSkins.map((skin) => {
            const active = state.cardSkinId === skin.id;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => setCardSkin(skin.id)}
                style={optionButtonStyle(active)}
                aria-pressed={active}
                data-active={active}
              >
                <strong>{skin.name}</strong>
                <span style={{ fontSize: scaleFont('12px', fontScale), color: theme.colors.textSecondary }}>{skin.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>Table felt</h3>
        <div style={optionGridStyle}>
          {available.tableSkins.map((skin) => {
            const active = state.tableSkinId === skin.id;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => setTableSkin(skin.id)}
                style={optionButtonStyle(active)}
                aria-pressed={active}
                data-active={active}
              >
                <strong>{skin.name}</strong>
                <span style={{ fontSize: scaleFont('12px', fontScale), color: theme.colors.textSecondary }}>{skin.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>Piece skins</h3>
        <div style={optionGridStyle}>
          {available.pieceSkins.map((skin) => {
            const active = state.pieceSkinId === skin.id;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => setPieceSkin(skin.id)}
                style={optionButtonStyle(active)}
                aria-pressed={active}
                data-active={active}
              >
                <strong>{skin.name}</strong>
                <span style={{ fontSize: scaleFont('12px', fontScale), color: theme.colors.textSecondary }}>{skin.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>Backdrops</h3>
        <div style={optionGridStyle}>
          {available.backdrops.map((entry) => {
            const active = state.backdropId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setBackdrop(entry.id)}
                style={optionButtonStyle(active)}
                aria-pressed={active}
                data-active={active}
              >
                <strong>{entry.name}</strong>
                <span style={{ fontSize: scaleFont('12px', fontScale), color: theme.colors.textSecondary }}>{entry.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>Accessibility</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {[
            { id: 'highContrast', label: 'High contrast' },
            { id: 'reducedMotion', label: 'Reduced motion' },
            { id: 'largeText', label: 'Large text' },
          ].map((entry) => {
            const active = Boolean(accessibility?.[entry.id]);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => toggleAccessibility(entry.id)}
                style={toggleButtonStyle(active)}
                aria-pressed={active}
                data-active={active}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </section>

      <button type="button" onClick={reset} style={resetButtonStyle}>
        Reset to theme defaults
      </button>
    </aside>
  );
};

export default CustomizationPanel;







