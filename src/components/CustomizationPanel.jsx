import { useCustomization, useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import { useTheme } from '../ui/ThemeContext.jsx';

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
  const { theme, cards, cardSkin, table, tableSkin, pieces, pieceSkin, backdrop, accessibility, presetId } = useCustomizationTokens();

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
    fontSize: '22px',
  };

  const feltPreviewStyle = {
    borderRadius: theme.radii.sm,
    border: `1px solid ${table.border ?? theme.colors.border}`,
    background: table.felt ?? theme.table?.felt ?? theme.colors.surfaceMuted,
    color: table.text ?? theme.colors.textPrimary,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: '12px',
    display: 'inline-flex',
    alignSelf: 'flex-start',
  };

  const tokenChipStyle = {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  };

  const chipDotStyle = {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: `1px solid ${theme.colors.border}`,
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };

  const sectionHeaderStyle = {
    margin: 0,
    fontSize: '14px',
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
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  });

  const toggleButtonStyle = (active) => ({
    borderRadius: theme.radii.sm,
    border: `1px solid ${active ? theme.colors.accentPrimary : theme.colors.border}`,
    background: active ? theme.colors.accentPrimarySoft : theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    padding: '10px 12px',
    cursor: 'pointer',
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
              <h2 style={{ margin: 0, fontSize: '18px', color: theme.colors.textPrimary }}>Your style</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme.colors.textSecondary }}>
                {cardSkin.name} · {tableSkin.name}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px', color: theme.colors.textMuted }}>
              <span>{pieceSkin.name}</span>
              <span>{backdrop.name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center', position: 'relative' }}>
            <div style={cardPreviewStyle}>AS</div>
            <span style={feltPreviewStyle}>Felt</span>
            <div style={tokenChipStyle}>
              <span style={{ ...chipDotStyle, background: pieces.primary }} />
              <span style={{ ...chipDotStyle, background: pieces.secondary }} />
              <span style={{ ...chipDotStyle, background: pieces.highlight }} />
            </div>
          </div>
          {presetId ? (
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>Preset: {available.presets.find((preset) => preset.id === presetId)?.name}</span>
          ) : (
            <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>Custom mix</span>
          )}
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
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>{preset.description}</span>
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
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Palette</span>
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
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>{skin.description}</span>
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
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>{skin.description}</span>
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
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>{skin.description}</span>
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
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>{entry.description}</span>
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
