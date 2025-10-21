import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const HostControls = ({
  canStart,
  onStart,
  onAddBot,
  onRemoveBot,
  seatManagerEnabled,
  onSeatManagerOpen,
  onConfigureTable,
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;
  const transitionStyle = prefersReducedMotion ? 'none' : 'background 0.2s ease, border 0.2s ease';

  const baseButtonStyle = useMemo(() => ({
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: '999px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    cursor: 'pointer',
    transition: transitionStyle,
    fontSize: scaleFont('14px', fontScale),
  }), [theme, transitionStyle, fontScale]);

  const primaryButtonStyle = useMemo(() => ({
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.radii.sm,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: scaleFont('15px', fontScale),
    transition: prefersReducedMotion ? 'none' : 'background 0.2s ease',
  }), [theme, fontScale, prefersReducedMotion]);

  const outlineButtonStyle = useMemo(() => ({
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: scaleFont('15px', fontScale),
    transition: transitionStyle,
  }), [theme, fontScale, transitionStyle]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onAddBot}
          style={{
            ...baseButtonStyle,
            border: `1px solid ${theme.colors.accentSuccess}`,
            background: theme.colors.accentSuccessSoft,
            color: theme.colors.accentSuccess,
          }}
        >
          + Bot
        </button>
        <button
          type="button"
          onClick={onRemoveBot}
          style={{
            ...baseButtonStyle,
            border: `1px solid ${theme.colors.accentDanger}`,
            background: theme.colors.accentDangerSoft,
            color: theme.colors.accentDanger,
          }}
        >
          - Bot
        </button>
        <button
          type="button"
          onClick={onSeatManagerOpen}
          disabled={!seatManagerEnabled}
          style={{
            ...baseButtonStyle,
            border: `1px solid ${theme.colors.accentPrimary}`,
            background: theme.colors.accentPrimarySoft,
            color: theme.colors.accentPrimary,
            opacity: seatManagerEnabled ? 1 : 0.45,
            cursor: seatManagerEnabled ? 'pointer' : 'not-allowed',
          }}
        >
          Seat select
        </button>
      </div>

      <div style={{ display: 'flex', gap: theme.spacing.xs, justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          style={{
            ...primaryButtonStyle,
            width: '140px',
            opacity: canStart ? 1 : 0.4,
            cursor: canStart ? 'pointer' : 'not-allowed',
          }}
        >
          Start game
        </button>
        {onConfigureTable && (
          <button
            type="button"
            onClick={onConfigureTable}
            style={{ ...outlineButtonStyle, width: '140px' }}
          >
            Table options
          </button>
        )}
      </div>
    </section>
  );
};
