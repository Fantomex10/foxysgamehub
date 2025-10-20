import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';
import { CreateLobbyRow } from './CreateLobbyRow.jsx';

export const CreateLobbyStepperRow = ({
  label,
  value,
  onIncrement,
  onDecrement,
  incrementDisabled,
  decrementDisabled,
  incrementAriaLabel,
  decrementAriaLabel,
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const buttonStyle = useMemo(() => ({
    width: '32px',
    height: '32px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('18px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
  }), [theme, fontScale]);

  const valueStyle = useMemo(() => ({
    minWidth: '32px',
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: scaleFont('15px', fontScale),
    fontWeight: 600,
  }), [theme, fontScale]);

  return (
    <CreateLobbyRow label={label}>
      <button
        type="button"
        onClick={onDecrement}
        style={{
          ...buttonStyle,
          opacity: decrementDisabled ? 0.4 : 1,
          cursor: decrementDisabled ? 'not-allowed' : 'pointer',
        }}
        disabled={decrementDisabled}
        aria-label={decrementAriaLabel}
      >
        {'\u2212'}
      </button>
      <span style={valueStyle}>{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        style={{
          ...buttonStyle,
          opacity: incrementDisabled ? 0.4 : 1,
          cursor: incrementDisabled ? 'not-allowed' : 'pointer',
        }}
        disabled={incrementDisabled}
        aria-label={incrementAriaLabel}
      >
        +
      </button>
    </CreateLobbyRow>
  );
};
