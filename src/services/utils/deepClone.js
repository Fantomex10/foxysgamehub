const hasStructuredClone = typeof globalThis.structuredClone === 'function';

const structuredCloneFallback = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    throw new Error(`Failed to clone value: ${error.message}`);
  }
};

export const deepClone = (value) => {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (hasStructuredClone) {
    try {
      return globalThis.structuredClone(value);
    } catch {
      // Fall back to JSON clone when structuredClone cannot handle the payload (e.g., functions).
    }
  }

  return structuredCloneFallback(value);
};
