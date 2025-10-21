import React, { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyAdjuster = ({
  label,
  value,
  onIncrement,
  onDecrement,
  incrementDisabled = false,
  decrementDisabled = false,
  incrementAriaLabel,
  decrementAriaLabel,
  helperText,
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const containerStyle = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.xs,
    }),
    [theme.spacing.xs],
  );

  const rowStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
      background: theme.colors.surfaceMuted,
      border: `1px solid ${theme.colors.borderSubtle}`,
      borderRadius: theme.radii.md,
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    }),
    [theme],
  );

  const labelStyle = useMemo(
    () => ({
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontSize: scaleFont('11px', fontScale),
      color: theme.colors.textMuted,
      fontWeight: 600,
    }),
    [theme, fontScale],
  );

  const valueStyle = useMemo(
    () => ({
      fontSize: scaleFont('18px', fontScale),
      fontWeight: 700,
      color: theme.colors.textPrimary,
      minWidth: '32px',
      textAlign: 'center',
    }),
    [theme, fontScale],
  );

  const buttonStyle = useMemo(
    () => ({
      width: '36px',
      height: '32px',
      borderRadius: theme.radii.sm,
      border: `1px solid ${theme.buttons.subtleBorder}`,
      background: theme.buttons.subtleBg,
      color: theme.buttons.subtleText,
      fontSize: scaleFont('16px', fontScale),
      fontWeight: 600,
      cursor: 'pointer',
      transition: accessibility?.prefersReducedMotion ? 'none' : 'background 0.2s ease',
    }),
    [theme, fontScale, accessibility?.prefersReducedMotion],
  );

  const helperStyle = useMemo(
    () => ({
      margin: 0,
      fontSize: scaleFont('12px', fontScale),
      color: theme.colors.textSecondary,
    }),
    [theme, fontScale],
  );

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <div>
          <span style={labelStyle}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={decrementDisabled ? undefined : onDecrement}
            disabled={decrementDisabled}
            aria-label={decrementAriaLabel}
            style={{
              ...buttonStyle,
              opacity: decrementDisabled ? 0.45 : 1,
              cursor: decrementDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            -
          </button>
          <span style={valueStyle}>{value}</span>
          <button
            type="button"
            onClick={incrementDisabled ? undefined : onIncrement}
            disabled={incrementDisabled}
            aria-label={incrementAriaLabel}
            style={{
              ...buttonStyle,
              opacity: incrementDisabled ? 0.45 : 1,
              cursor: incrementDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            +
          </button>
        </div>
      </div>
      {helperText ? <p style={helperStyle}>{helperText}</p> : null}
    </div>
  );
};
