import { useCustomizationTokens } from '../../customization/CustomizationContext.jsx';

export const colorWithOpacity = (color, opacity) => {
  if (!color) {
    return `rgba(0,0,0,${opacity})`;
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const normalized = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex;
    const intVal = Number.parseInt(normalized, 16);
    if (Number.isNaN(intVal)) return color;
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (color.startsWith('rgb')) {
    const values = color
      .replace(/rgba?\(|\)/g, '')
      .split(',')
      .map((value) => Number.parseFloat(value.trim()))
      .filter((value, index) => Number.isFinite(value) && index < 3);
    if (values.length === 3) {
      const [r, g, b] = values;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  return color;
};

export const resolveStatusColor = (status, theme) => {
  if (status === 'ready') return theme.colors.accentSuccess;
  if (status === 'needsTime') return theme.colors.accentDanger;
  return theme.colors.accentWarning;
};

export const resolveStatusSoftColor = (status, theme) => {
  if (status === 'ready') {
    return theme.colors.accentSuccessSoft ?? colorWithOpacity(theme.colors.accentSuccess, 0.2);
  }
  if (status === 'needsTime') {
    return theme.colors.accentDangerSoft ?? colorWithOpacity(theme.colors.accentDanger, 0.2);
  }
  return theme.colors.accentWarningSoft ?? colorWithOpacity(theme.colors.accentWarning, 0.2);
};

export const useLobbyTokens = () => useCustomizationTokens();
