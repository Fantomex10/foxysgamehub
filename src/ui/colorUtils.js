const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const normaliseHex = (value) => {
  if (!HEX_COLOR_PATTERN.test(value)) {
    return null;
  }
  const hex = value.slice(1);
  if (hex.length === 3) {
    return `#${hex.split('').map((char) => char + char).join('')}`;
  }
  return value;
};

const parseHexChannels = (hex) => {
  const normalized = normaliseHex(hex);
  if (!normalized) {
    return null;
  }
  const value = Number.parseInt(normalized.slice(1), 16);
  if (Number.isNaN(value)) {
    return null;
  }
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

export const withAlpha = (color, alpha, fallback = null) => {
  if (typeof color !== 'string') {
    return fallback;
  }
  const channels = parseHexChannels(color.trim());
  if (!channels) {
    return fallback;
  }
  const clampedAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : alpha;
  return `rgba(${channels.r}, ${channels.g}, ${channels.b}, ${clampedAlpha})`;
};
