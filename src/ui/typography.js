export const scaleFont = (value, scale = 1, precision = 1) => {
  if (!value || scale === 1) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const scaled = Number.parseFloat((value * scale).toFixed(precision));
    return scaled;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  const match = /^(-?\d*\.?\d+)([a-z%]+)$/i.exec(trimmed);

  if (!match) {
    return value;
  }

  const [, numericPart, unit] = match;
  const numericValue = Number.parseFloat(numericPart);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  const scaled = Number.parseFloat((numericValue * scale).toFixed(precision));
  return `${scaled}${unit}`;
};
