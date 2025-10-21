import React, { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const SeatManagerSummary = ({
  seatCapacity,
  players,
  benchList,
  seatManagerEnabled,
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const containerStyle = useMemo(
    () => ({
      marginTop: theme.spacing.xs,
      padding: `${scaleFont('6px', fontScale)} ${scaleFont('10px', fontScale)}`,
      borderRadius: theme.radii.sm,
      background: theme.colors.surfaceMuted,
      border: `1px solid ${theme.colors.borderSubtle}`,
      color: theme.colors.textSecondary,
      fontSize: scaleFont('12px', fontScale),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.xs,
    }),
    [theme, fontScale],
  );

  const badgeStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '999px',
      background: theme.colors.surface,
      border: `1px solid ${theme.colors.borderSubtle}`,
      fontSize: scaleFont('11px', fontScale),
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }),
    [theme, fontScale],
  );

  const seatCount = `${players.length}/${seatCapacity ?? players.length}`;
  const benchCount = benchList?.length ?? 0;

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <span>
        Seats filled: <strong>{seatCount}</strong>
      </span>
      <span style={badgeStyle}>
        {seatManagerEnabled ? 'Seat manager ready' : 'Seat manager locked'}
        {benchCount > 0 ? ` • Bench ${benchCount}` : ''}
      </span>
    </div>
  );
};
