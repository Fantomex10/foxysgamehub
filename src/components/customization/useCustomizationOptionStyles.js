import { useMemo } from 'react';

export const useCustomizationOptionStyles = ({ theme, pieces, scaleFont, motionDuration, accessibility }) => {
  const transition = accessibility?.reducedMotion ? 'none' : `transform ${motionDuration('160ms')} ease`;

  const optionButtonStyle = useMemo(() => (
    ({ active, locked }) => ({
      borderRadius: theme.radii.sm,
      border: `1px solid ${active
        ? pieces.primary ?? theme.colors.accentPrimary
        : locked
          ? theme.colors.borderSubtle
          : theme.colors.border}`,
      background: active
        ? pieces.primary ?? theme.colors.accentPrimarySoft
        : locked
          ? theme.colors.surfaceMuted
          : theme.colors.surfaceMuted,
      color: locked ? theme.colors.textMuted : theme.colors.textPrimary,
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      textAlign: 'left',
      cursor: locked ? 'not-allowed' : 'pointer',
      opacity: locked ? 0.7 : 1,
      transition,
    })
  ), [theme, pieces, transition]);

  const unlockButtonStyle = useMemo(() => ({
    borderRadius: theme.radii.xs,
    border: `1px solid ${pieces.primary ?? theme.colors.accentPrimary}`,
    background: pieces.primary ?? theme.colors.accentPrimarySoft,
    color: theme.colors.textPrimary,
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: scaleFont('11px'),
  }), [theme, pieces, scaleFont]);

  const toggleButtonStyle = useMemo(() => (
    (active) => ({
      borderRadius: theme.radii.sm,
      border: `1px solid ${active ? pieces.primary ?? theme.colors.accentPrimary : theme.colors.border}`,
      background: active ? (pieces.secondary ?? theme.colors.accentPrimarySoft) : theme.colors.surfaceMuted,
      color: theme.colors.textPrimary,
      padding: '10px 12px',
      cursor: 'pointer',
      transition,
    })
  ), [theme, pieces, transition]);

  const sectionHeaderStyle = useMemo(() => ({
    margin: 0,
    fontSize: scaleFont('14px'),
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  }), [scaleFont, theme.colors.textMuted]);

  const optionGridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: theme.spacing.sm,
  }), [theme.spacing.sm]);

  return {
    optionButtonStyle,
    unlockButtonStyle,
    toggleButtonStyle,
    sectionHeaderStyle,
    optionGridStyle,
  };
};

export default useCustomizationOptionStyles;
