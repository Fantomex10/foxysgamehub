import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/CustomizationContext.jsx';

export const VisibilityToggle = ({ value, onChange, label = 'Visibility' }) => {
  const {
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  } = useCustomizationTokens();

  const labelStyle = useMemo(() => ({
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: scaleFont('11px'),
  }), [theme, scaleFont]);

  const transitionValue = accessibility?.reducedMotion ? 'none' : `background ${motionDuration('200ms')} ease, transform ${motionDuration('200ms')} ease`;

  const buttonStyle = (active) => ({
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${active ? pieces.primary ?? theme.buttons.primaryBorder ?? theme.colors.accentPrimary : theme.buttons.subtleBorder}`,
    background: active
      ? pieces.primary ? `${pieces.primary}22` : theme.buttons.primaryBg
      : theme.buttons.ghostBg,
    color: active ? theme.buttons.primaryText : theme.buttons.ghostText ?? theme.colors.textSecondary,
    fontSize: scaleFont('14px'),
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '72px',
    transition: transitionValue,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button type="button" onClick={() => onChange(false)} style={buttonStyle(!value)}>
          Public
        </button>
        <button type="button" onClick={() => onChange(true)} style={buttonStyle(value)}>
          Private
        </button>
      </div>
    </div>
  );
};
