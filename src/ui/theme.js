const baseTokens = {
  colors: {
    background: '#0f172a',
    surface: 'rgba(15,23,42,0.8)',
    surfaceAlt: 'rgba(15,23,42,0.7)',
    surfaceMuted: 'rgba(15,23,42,0.55)',
    surfaceElevated: 'rgba(15,23,42,0.65)',
    borderStrong: 'rgba(148,163,184,0.35)',
    border: 'rgba(148,163,184,0.25)',
    borderSoft: 'rgba(148,163,184,0.2)',
    borderSubtle: 'rgba(148,163,184,0.18)',
    borderFaint: 'rgba(148,163,184,0.15)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5f5',
    textMuted: '#94a3b8',
    textHighlight: '#fef3c7',
    accentPrimary: '#38bdf8',
    accentPrimarySoft: 'rgba(56,189,248,0.18)',
    accentInfo: '#38bdf8',
    accentSuccess: '#34d399',
    accentWarning: '#fbbf24',
    accentDanger: '#f87171',
    accentDangerSoft: 'rgba(248,113,113,0.35)',
    accentSuccessSoft: 'rgba(34,197,94,0.45)',
    accentWarningSoft: 'rgba(250,204,21,0.35)',
    accentFocus: '#38bdf8',
    cardFace: '#1f2937',
    cardBack: '#2563eb',
    cardBorder: 'rgba(148,163,184,0.3)',
    cardHighlight: 'rgba(56,189,248,0.35)',
    tableFelt: '#14532d',
    tableBorder: 'rgba(34,197,94,0.35)',
    tableHighlight: '#4ade80',
    overlayScrim: 'rgba(15,23,42,0.65)',
  },
  radii: {
    xs: '8px',
    sm: '12px',
    md: '18px',
    lg: '20px',
    xl: '24px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  shadows: {
    shell: '0 6px 18px rgba(15,23,42,0.45)',
    panel: '0 32px 64px rgba(15,23,42,0.6)',
  },
  gradients: {
    shellTop: 'radial-gradient(circle at top, rgba(56, 189, 248, 0.12), transparent 55%)',
    shellBottom: 'radial-gradient(circle at bottom, rgba(249, 115, 22, 0.08), transparent 50%)',
  },
  cards: {
    face: '#1f2937',
    back: '#2563eb',
    text: '#f8fafc',
    accent: '#38bdf8',
    border: 'rgba(148,163,184,0.4)',
  },
  table: {
    felt: '#14532d',
    border: 'rgba(34,197,94,0.35)',
    highlight: '#4ade80',
    panel: 'rgba(15,23,42,0.75)',
    text: '#f8fafc',
  },
  buttons: {
    primaryBg: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(56,189,248,0.25))',
    primaryText: '#e0f2fe',
    primaryBorder: 'rgba(59,130,246,0.35)',
    subtleBg: 'rgba(30,41,59,0.35)',
    subtleBorder: 'rgba(148,163,184,0.2)',
    subtleText: '#cbd5f5',
    dangerBg: 'rgba(248,113,113,0.15)',
    dangerBorder: 'rgba(248,113,113,0.35)',
    dangerText: '#fecaca',
    ghostBg: 'rgba(15,23,42,0.15)',
    ghostText: '#94a3b8',
    iconBg: 'rgba(30,41,59,0.55)',
    iconActiveBg: 'rgba(30,41,59,0.7)',
    iconBorder: 'rgba(148,163,184,0.35)',
  },
  overlays: {
    scrim: 'rgba(15,23,42,0.65)',
    panel: 'rgba(15,23,42,0.85)',
  },
};

const deepFreeze = (value) => {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
};

const mergeTokens = (base, overrides = {}) => {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeTokens(base[key] ?? {}, value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

const createTheme = (id, config = {}) => {
  const merged = mergeTokens(baseTokens, config);
  return deepFreeze({
    id,
    name: config.name ?? id,
    ...merged,
  });
};

export const themes = {
  midnight: createTheme('midnight', {
    name: 'Midnight Shift',
    customization: {
      suggestedPresetId: 'midnight-classic',
      suggestedCardSkinId: 'classic',
      suggestedTableSkinId: 'emerald-club',
      suggestedPieceSkinId: 'classic',
      suggestedBackdropId: 'nebula-night',
    },
  }),
  aurora: createTheme('aurora', {
    name: 'Aurora Bloom',
    customization: {
      suggestedPresetId: 'aurora-bloom',
      suggestedCardSkinId: 'aurora',
      suggestedTableSkinId: 'aurora-veil',
      suggestedPieceSkinId: 'aurora',
      suggestedBackdropId: 'aurora-sky',
    },
    colors: {
      background: '#09091a',
      surface: 'rgba(18,14,35,0.8)',
      surfaceAlt: 'rgba(27,19,54,0.8)',
      surfaceMuted: 'rgba(17,24,39,0.6)',
      textSecondary: '#dbeafe',
      textMuted: '#b4c6f0',
      accentPrimary: '#a855f7',
      accentPrimarySoft: 'rgba(168,85,247,0.25)',
      accentInfo: '#a855f7',
      accentDanger: '#f472b6',
      accentDangerSoft: 'rgba(244,114,182,0.35)',
      accentSuccess: '#34d399',
      accentWarning: '#f472b6',
      cardFace: '#1e1b4b',
      cardBack: '#7c3aed',
      cardHighlight: 'rgba(168,85,247,0.35)',
      tableFelt: '#1b184f',
      tableBorder: 'rgba(168,85,247,0.38)',
      tableHighlight: '#c084fc',
      overlayScrim: 'rgba(12,10,30,0.7)',
    },
    gradients: {
      shellTop: 'radial-gradient(circle at top, rgba(168,85,247,0.18), transparent 55%)',
      shellBottom: 'radial-gradient(circle at bottom, rgba(236,72,153,0.15), transparent 50%)',
    },
    cards: {
      face: '#1e1b4b',
      back: '#7c3aed',
      accent: '#f9a8d4',
    },
    table: {
      felt: '#1b184f',
      border: 'rgba(168,85,247,0.38)',
      highlight: '#c084fc',
      panel: 'rgba(24,20,45,0.78)',
    },
    buttons: {
      primaryBg: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.35))',
      primaryText: '#fce7f3',
      primaryBorder: 'rgba(236,72,153,0.45)',
      subtleBg: 'rgba(30,27,75,0.45)',
      subtleBorder: 'rgba(129,140,248,0.25)',
      subtleText: '#e2e8f0',
      iconBg: 'rgba(46,34,82,0.55)',
      iconActiveBg: 'rgba(46,34,82,0.75)',
      iconBorder: 'rgba(129,140,248,0.35)',
      dangerBg: 'rgba(244,114,182,0.18)',
      dangerBorder: 'rgba(244,114,182,0.4)',
      dangerText: '#ffe4f0',
      ghostText: '#c4b5fd',
    },
  }),
  summit: createTheme('summit', {
    name: 'Summit Dawn',
    customization: {
      suggestedPresetId: 'summit-dawn',
      suggestedCardSkinId: 'summit',
      suggestedTableSkinId: 'summit-felt',
      suggestedPieceSkinId: 'summit',
      suggestedBackdropId: 'summit-horizon',
    },
    colors: {
      background: '#0b1a17',
      surface: 'rgba(11,26,23,0.82)',
      surfaceAlt: 'rgba(15,32,28,0.78)',
      surfaceMuted: 'rgba(13,29,24,0.6)',
      textSecondary: '#cde4de',
      textMuted: '#9bbab3',
      accentPrimary: '#0ea5e9',
      accentPrimarySoft: 'rgba(14,165,233,0.22)',
      accentInfo: '#2dd4bf',
      accentSuccess: '#22c55e',
      accentWarning: '#f59e0b',
      accentDanger: '#f97316',
      accentDangerSoft: 'rgba(249,115,22,0.35)',
      cardFace: '#134e4a',
      cardBack: '#047857',
      cardHighlight: 'rgba(45,212,191,0.35)',
      tableFelt: '#164e63',
      tableBorder: 'rgba(14,165,233,0.38)',
      tableHighlight: '#38bdf8',
      overlayScrim: 'rgba(8,20,18,0.65)',
    },
    gradients: {
      shellTop: 'radial-gradient(circle at top, rgba(14,165,233,0.18), transparent 55%)',
      shellBottom: 'radial-gradient(circle at bottom, rgba(245,158,11,0.15), transparent 50%)',
    },
    cards: {
      face: '#134e4a',
      back: '#0f766e',
      accent: '#2dd4bf',
    },
    table: {
      felt: '#164e63',
      border: 'rgba(14,165,233,0.38)',
      highlight: '#38bdf8',
      panel: 'rgba(11,26,23,0.82)',
    },
    buttons: {
      primaryBg: 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(45,212,191,0.35))',
      primaryText: '#ecfeff',
      primaryBorder: 'rgba(45,212,191,0.45)',
      subtleBg: 'rgba(15,32,28,0.45)',
      subtleBorder: 'rgba(45,212,191,0.25)',
      subtleText: '#d1fae5',
      iconBg: 'rgba(12,38,34,0.55)',
      iconActiveBg: 'rgba(12,38,34,0.72)',
      iconBorder: 'rgba(45,212,191,0.35)',
      dangerBg: 'rgba(249,115,22,0.18)',
      dangerBorder: 'rgba(249,115,22,0.4)',
      dangerText: '#ffedd5',
      ghostText: '#a5f3fc',
    },
  }),
};

deepFreeze(themes);

export const defaultThemeId = 'midnight';
export const defaultTheme = themes[defaultThemeId];
export const theme = defaultTheme; // backward compatibility

export const listThemes = () => Object.values(themes);

export const getThemeById = (id) => themes[id] ?? defaultTheme;
