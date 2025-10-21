import React, { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const CreateLobbyRow = ({ label, children, alignTop = false, contentStyle }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const rowStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: alignTop ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
      color: theme.colors.textSecondary,
      fontSize: scaleFont('15px', fontScale),
    }),
    [alignTop, theme, fontScale],
  );

  const labelStyle = useMemo(
    () => ({
      minWidth: '110px',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontSize: scaleFont('11px', fontScale),
      fontWeight: 600,
    }),
    [theme, fontScale],
  );

  const wrapperStyle = useMemo(
    () => ({
      flex: 1,
      display: 'flex',
      gap: theme.spacing.xs,
      justifyContent: 'flex-end',
      ...(contentStyle ?? {}),
    }),
    [theme.spacing.xs, contentStyle],
  );

  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={wrapperStyle}>{children}</div>
    </div>
  );
};
