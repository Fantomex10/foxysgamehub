import React from 'react';

export const CustomizationPreview = ({
  theme,
  cards,
  cardSkin,
  table,
  tableSkin,
  pieces,
  pieceSkin,
  backdrop,
  presetId,
  availablePresets,
  scaleFont,
}) => {
  const containerStyle = {
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
    fontSize: scaleFont('22px'),
  };

  const feltPreviewStyle = {
    borderRadius: theme.radii.sm,
    border: `1px solid ${table.border ?? theme.colors.border}`,
    background: table.felt ?? theme.table?.felt ?? theme.colors.surfaceMuted,
    color: table.text ?? theme.colors.textPrimary,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: scaleFont('12px'),
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

  return (
    <div style={containerStyle}>
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
            <h2 style={{ margin: 0, fontSize: scaleFont('18px'), color: theme.colors.textPrimary }}>Your style</h2>
            <p style={{ margin: '4px 0 0', fontSize: scaleFont('13px'), color: theme.colors.textSecondary }}>
              {cardSkin.name} · {tableSkin.name}
            </p>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            fontSize: scaleFont('12px'),
            color: theme.colors.textMuted,
          }}>
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
          <span style={{ fontSize: scaleFont('12px'), color: theme.colors.textMuted }}>
            Preset: {availablePresets.find((preset) => preset.id === presetId)?.name}
          </span>
        ) : (
          <span style={{ fontSize: scaleFont('12px'), color: theme.colors.textMuted }}>Custom mix</span>
        )}
      </div>
    </div>
  );
};

export default CustomizationPreview;
