import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

export const FooterActions = ({ isHost, onReset, onBack }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;

  const buttonStyle = useMemo(() => ({
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: '999px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    cursor: 'pointer',
    fontSize: scaleFont('14px', fontScale),
    transition: prefersReducedMotion ? 'none' : 'background 0.2s ease, border 0.2s ease',
  }), [theme, fontScale, prefersReducedMotion]);

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    width: '100%',
  };

  const buttonWrapperStyle = {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={buttonWrapperStyle}>
        {isHost && (
          <button type="button" onClick={onReset} style={buttonStyle}>
            Reset lobby
          </button>
        )}
        <button type="button" onClick={onBack} style={buttonStyle}>
          Back to hub
        </button>
      </div>
    </div>
  );
};
