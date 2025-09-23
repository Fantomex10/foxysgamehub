import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/CustomizationContext.jsx';

export const NumericStepper = ({
  label,
  value,
  displayValue,
  min,
  max,
  onChange,
  decreaseLabel = 'Decrease value',
  increaseLabel = 'Increase value',
}) => {
  const { theme, scaleFont } = useCustomizationTokens();

  const buttonStyle = useMemo(() => ({
    width: '32px',
    height: '32px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('18px'),
    fontWeight: 600,
    cursor: 'pointer',
  }), [theme, scaleFont]);

  const valueStyle = useMemo(() => ({
    minWidth: '32px',
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: scaleFont('15px'),
    fontWeight: 600,
  }), [theme, scaleFont]);

  const labelStyle = useMemo(() => ({
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: scaleFont('11px'),
  }), [theme, scaleFont]);

  const handleDecrease = () => {
    const next = typeof min === 'number' ? Math.max(min, value - 1) : value - 1;
    onChange(next);
  };

  const handleIncrease = () => {
    const next = typeof max === 'number' ? Math.min(max, value + 1) : value + 1;
    onChange(next);
  };

  const disableDecrease = typeof min === 'number' ? value <= min : false;
  const disableIncrease = typeof max === 'number' ? value >= max : false;
  const shownValue = displayValue ?? value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={handleDecrease}
          style={{ ...buttonStyle, opacity: disableDecrease ? 0.45 : 1, cursor: disableDecrease ? 'not-allowed' : 'pointer' }}
          aria-label={decreaseLabel}
          disabled={disableDecrease}
        >
          −
        </button>
        <span style={valueStyle}>{shownValue}</span>
        <button
          type="button"
          onClick={handleIncrease}
          style={{ ...buttonStyle, opacity: disableIncrease ? 0.45 : 1, cursor: disableIncrease ? 'not-allowed' : 'pointer' }}
          aria-label={increaseLabel}
          disabled={disableIncrease}
        >
          +
        </button>
      </div>
    </div>
  );
};
