import { useMemo } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { createButtonStyle } from '../ui/stylePrimitives.js';

export const useHeaderStyles = ({ theme, pieces, scaleFont, motionDuration, accessibility }) => {
  const isCompact = useMediaQuery('(max-width: 900px)');

  const headerStyle = useMemo(() => ({
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    padding: isCompact ? '14px 18px' : '18px 28px',
    borderBottom: `1px solid ${pieces.secondary ?? theme.colors.border}`,
    background: theme.colors.surface,
    backdropFilter: 'blur(12px)',
    boxShadow: theme.shadows.shell,
    gap: isCompact ? '12px' : '16px',
  }), [isCompact, theme, pieces.secondary]);

  const iconButtonStyle = useMemo(
    () => createButtonStyle(
      { theme, pieces, scaleFont, motionDuration, accessibility },
      'icon',
      {
        width: isCompact ? '40px' : '44px',
        height: isCompact ? '40px' : '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    ),
    [theme, pieces, scaleFont, motionDuration, accessibility, isCompact],
  );

  const buttonStyles = (active, disabled) => ({
    ...iconButtonStyle,
    opacity: disabled ? 0.6 : active ? 1 : 0.85,
    cursor: disabled ? 'default' : 'pointer',
    background: active ? (theme.buttons.iconActiveBg ?? iconButtonStyle.background) : iconButtonStyle.background,
    border: `1px solid ${active
      ? pieces.primary ?? theme.buttons.iconBorder ?? theme.colors.border
      : pieces.secondary ?? theme.buttons.iconBorder ?? theme.colors.border}`,
  });

  return {
    isCompact,
    headerStyle,
    buttonStyles,
  };
};

export default useHeaderStyles;
