import React, { useMemo } from 'react';
import { scaleFont } from '../../ui/typography.js';

const buildToneStyles = (theme) => ({
  primary: {
    border: `1px solid ${theme.buttons.primaryBorder}`,
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
  },
  success: {
    border: `1px solid ${theme.colors.accentSuccess}`,
    background: theme.colors.accentSuccessSoft ?? theme.colors.surfaceMuted,
    color: theme.colors.accentSuccess,
  },
  danger: {
    border: `1px solid ${theme.colors.accentDanger}`,
    background: theme.colors.accentDangerSoft ?? theme.colors.surfaceMuted,
    color: theme.colors.accentDanger,
  },
  warning: {
    border: `1px solid ${theme.colors.accentWarning ?? theme.colors.accentPrimary}`,
    background: theme.colors.accentWarningSoft ?? theme.colors.surfaceMuted,
    color: theme.colors.accentWarning ?? theme.colors.accentPrimary,
  },
  secondary: {
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
  },
  ghost: {
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
  },
  default: {},
});

export const LobbyActionButton = ({
  action,
  theme,
  isCompact,
  fontScale,
  prefersReducedMotion,
  columns,
  variant = 'primary',
}) => {
  const {
    key,
    label,
    onClick,
    disabled,
    tone = 'default',
    inactiveTone,
    active = false,
    span = 1,
    wordSpacing,
    icon,
  } = action;

  const toneStyles = useMemo(() => buildToneStyles(theme), [theme]);

  const isSecondary = variant === 'secondary';

  const baseStyle = useMemo(
    () => ({
      padding: isSecondary ? (isCompact ? '4px 8px' : '6px 10px') : isCompact ? '4px 8px' : '7px 10px',
      borderRadius: theme.radii.sm,
      border: `1px solid ${theme.buttons.subtleBorder}`,
      background: theme.colors.surfaceMuted,
      color: theme.colors.textPrimary,
      fontSize: scaleFont(isCompact ? '11px' : '12px', fontScale),
      fontWeight: 600,
      cursor: 'pointer',
      width: '100%',
      height: isSecondary ? (isCompact ? 32 : 36) : isCompact ? 32 : 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'none',
      transition: prefersReducedMotion ? 'none' : 'background 0.2s ease, border 0.2s ease, color 0.2s ease',
    }),
    [isCompact, theme, fontScale, prefersReducedMotion, isSecondary],
  );

  const toneKey = active ? tone : inactiveTone ?? tone;
  const toneStyle = toneStyles[toneKey] ?? toneStyles.default;

  let renderedIcon = null;
  if (icon) {
    if (icon.type === 'component' && icon.Component) {
      const IconComponent = icon.Component;
      renderedIcon = (
        <IconComponent
          size={icon.size ?? (isCompact ? 16 : 18)}
          aria-hidden="true"
        />
      );
    } else if (icon.type === 'image' && icon.src) {
      renderedIcon = (
        <img
          src={icon.src}
          alt={icon.alt ?? ''}
          style={{
            width: icon.size ?? (isCompact ? 16 : 18),
            height: icon.size ?? (isCompact ? 16 : 18),
          }}
        />
      );
    } else if (React.isValidElement(icon)) {
      renderedIcon = icon;
    }
  }

  const showPlainText = renderedIcon == null && variant === 'secondary';

  return (
    <button
      key={key ?? label}
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        ...baseStyle,
        ...toneStyle,
        opacity: disabled ? 0.45 : active ? 1 : 0.9,
        cursor: disabled ? 'not-allowed' : 'pointer',
        gridColumn: `span ${Math.min(span, columns)}`,
        ...(wordSpacing ? { wordSpacing } : {}),
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          lineHeight: 1,
          position: 'relative',
        }}
      >
        {renderedIcon ? (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderedIcon}
          </span>
        ) : null}
        {showPlainText ? (
          <span>{label}</span>
        ) : (
          <span
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {label}
          </span>
        )}
      </span>
    </button>
  );
};

