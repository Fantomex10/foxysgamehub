const fallback = (value, defaultValue) => (value === undefined || value === null ? defaultValue : value);

const resolveSpacing = (theme, value, defaultValue) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  if (typeof value === 'string') {
    return theme.spacing?.[value] ?? value;
  }
  return value;
};

export const createOverlayStyle = ({ theme }, overrides = {}) => ({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: fallback(theme.overlays?.scrim, 'rgba(15,23,42,0.65)'),
  ...overrides,
});

export const createSurfaceStyle = ({ theme }, overrides = {}) => ({
  background: fallback(theme.colors?.surface, 'rgba(15,23,42,0.9)'),
  border: `1px solid ${fallback(theme.colors?.border, 'rgba(148,163,184,0.25)')}`,
  color: fallback(theme.colors?.textPrimary, '#f8fafc'),
  borderRadius: fallback(theme.radii?.lg, '18px'),
  boxShadow: fallback(theme.shadows?.panel, '0 32px 64px rgba(15,23,42,0.65)'),
  ...overrides,
});

export const createStatusMessageStyle = ({ theme, scaleFont }, options = {}) => {
  const {
    padding = fallback(theme.spacing?.xxl, '48px'),
    align = 'center',
    tone = 'default',
    fontSize = '14px',
  } = options;

  const toneColor = tone === 'danger'
    ? fallback(theme.colors?.accentDanger, fallback(theme.colors?.textPrimary, '#f8fafc'))
    : fallback(theme.colors?.textSecondary, fallback(theme.colors?.textPrimary, '#f8fafc'));

  return {
    padding,
    textAlign: align,
    color: toneColor,
    fontSize: typeof scaleFont === 'function' ? scaleFont(fontSize) : fontSize,
  };
};

export const createPanelContainerStyle = ({ theme, pieces }, overrides = {}) => {
  const rest = { ...overrides };
  const base = {
    background: fallback(theme.colors?.surface, 'rgba(15,23,42,0.9)'),
    border: `1px solid ${fallback(pieces?.secondary ?? theme.colors?.border, 'rgba(148,163,184,0.25)')}`,
    borderRadius: fallback(theme.radii?.lg, '18px'),
    boxShadow: fallback(theme.shadows?.panel, '0 32px 64px rgba(15,23,42,0.65)'),
    color: fallback(theme.colors?.textPrimary, '#f8fafc'),
  };

  if (rest.background !== undefined) {
    base.background = rest.background;
    delete rest.background;
  }
  if (rest.border !== undefined) {
    base.border = rest.border;
    delete rest.border;
  }
  if (rest.borderRadius !== undefined) {
    base.borderRadius = rest.borderRadius;
    delete rest.borderRadius;
  }
  if (rest.boxShadow !== undefined) {
    base.boxShadow = rest.boxShadow;
    delete rest.boxShadow;
  }
  if (rest.color !== undefined) {
    base.color = rest.color;
    delete rest.color;
  }
  if (rest.padding !== undefined) {
    base.padding = resolveSpacing(theme, rest.padding, rest.padding);
    delete rest.padding;
  }
  if (rest.gap !== undefined) {
    base.gap = resolveSpacing(theme, rest.gap, rest.gap);
    delete rest.gap;
  }

  return { ...base, ...rest };
};

export const createButtonStyle = (
  { theme, pieces, scaleFont, motionDuration, accessibility },
  variant = 'subtle',
  overrides = {},
) => {
  const duration = typeof motionDuration === 'function' ? motionDuration('0.2s') : '0.2s';
  const variantStyles = {
    primary: {
      background: fallback(theme.buttons?.primaryBg, theme.colors?.accentPrimary),
      border: `1px solid ${fallback(theme.buttons?.primaryBorder, theme.colors?.accentPrimary)}`,
      color: fallback(theme.buttons?.primaryText, theme.colors?.textPrimary),
    },
    subtle: {
      background: fallback(theme.buttons?.subtleBg, 'transparent'),
      border: `1px solid ${fallback(theme.buttons?.subtleBorder, theme.colors?.border)}`,
      color: fallback(theme.buttons?.subtleText, theme.colors?.textSecondary),
    },
    danger: {
      background: fallback(theme.buttons?.dangerBg, theme.colors?.accentDangerSoft),
      border: `1px solid ${fallback(theme.buttons?.dangerBorder, theme.colors?.accentDanger)}`,
      color: fallback(theme.buttons?.dangerText, theme.colors?.accentDanger),
    },
    ghost: {
      background: fallback(theme.buttons?.ghostBg, 'transparent'),
      border: `1px solid ${fallback(theme.buttons?.subtleBorder, theme.colors?.border)}`,
      color: fallback(theme.buttons?.ghostText, theme.colors?.textSecondary),
    },
    icon: {
      background: fallback(theme.buttons?.iconBg, theme.colors?.surfaceMuted),
      border: `1px solid ${fallback(theme.buttons?.iconBorder, pieces?.secondary ?? theme.colors?.border)}`,
      color: fallback(theme.colors?.textPrimary, '#f8fafc'),
      padding: 0,
    },
  };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: fallback(theme.radii?.md, '18px'),
    cursor: 'pointer',
    textDecoration: 'none',
    transition: accessibility?.reducedMotion ? 'none' : `background ${duration} ease, opacity ${duration} ease`,
    ...((variantStyles[variant]) || variantStyles.subtle),
  };

  const rest = { ...overrides };

  if (rest.fontSize !== undefined) {
    rest.fontSize = typeof scaleFont === 'function' ? scaleFont(rest.fontSize) : rest.fontSize;
  }
  if (rest.padding !== undefined) {
    rest.padding = resolveSpacing(theme, rest.padding, rest.padding);
  }
  if (rest.gap !== undefined) {
    rest.gap = resolveSpacing(theme, rest.gap, rest.gap);
  }

  return { ...base, ...rest };
};

export const createActionButtonStyle = (
  tokens,
  tone = 'default',
  overrides = {},
) => {
  const variantMap = {
    primary: 'primary',
    danger: 'danger',
    ghost: 'ghost',
    subtle: 'subtle',
    default: 'subtle',
  };
  const variant = variantMap[tone] ?? 'subtle';

  const {
    theme,
  } = tokens;

  return createButtonStyle(
    tokens,
    variant,
    {
      padding: overrides.padding ?? '12px 14px',
      borderRadius: overrides.borderRadius ?? theme?.radii?.sm ?? theme?.radii?.md ?? '12px',
      display: overrides.display ?? 'flex',
      justifyContent: overrides.justifyContent ?? 'space-between',
      alignItems: overrides.alignItems ?? 'center',
      fontSize: overrides.fontSize ?? '14px',
      ...overrides,
    },
  );
};

export const createStackStyle = ({ theme }, options = {}) => {
  const {
    direction = 'column',
    gap = 'md',
    align = 'stretch',
    justify = 'flex-start',
  } = options;

  return {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap: resolveSpacing(theme, gap, theme.spacing?.md ?? '16px'),
  };
};
