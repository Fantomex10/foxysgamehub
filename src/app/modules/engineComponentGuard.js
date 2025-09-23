import { createElement } from 'react';

const defaultTypeCheckers = {
  array: Array.isArray,
  boolean: (value) => typeof value === 'boolean',
  function: (value) => typeof value === 'function',
  number: (value) => typeof value === 'number',
  object: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  string: (value) => typeof value === 'string',
};

const missingWarnings = new Set();

const recordWarning = (key, message) => {
  if (missingWarnings.has(key)) {
    return;
  }
  missingWarnings.add(key);
  console.error(message);
};

const resolveEnvironmentMode = () => {
  if (typeof globalThis !== 'undefined' && globalThis.process?.env?.NODE_ENV) {
    return globalThis.process.env.NODE_ENV;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
    return import.meta.env.MODE;
  }

  return 'development';
};

const shouldValidate = () => resolveEnvironmentMode() !== 'production';

const validateProps = (componentName, displayName, spec, props, typeCheckers = defaultTypeCheckers) => {
  if (!shouldValidate() || !Array.isArray(spec) || spec.length === 0) {
    return;
  }

  spec.forEach(({ name, required = false, type }) => {
    const value = props[name];
    const warningKey = `${componentName}:${displayName}:${name}`;

    if (required && (value === undefined || value === null)) {
      recordWarning(`${warningKey}:missing`, `Engine ${componentName} component "${displayName}" is missing required prop "${name}".`);
      return;
    }

    if (value === undefined || value === null || !type) {
      return;
    }

    const checker = typeCheckers[type];
    if (typeof checker === 'function' && !checker(value)) {
      recordWarning(`${warningKey}:type`, `Engine ${componentName} component "${displayName}" expected prop "${name}" to be of type ${type}.`);
    }
  });
};

export const wrapEngineComponent = (componentName, Component, spec) => {
  if (!Component) {
    return Component;
  }

  const displayName = Component.displayName || Component.name || 'AnonymousEngineComponent';

  const Guarded = (props) => {
    validateProps(componentName, displayName, spec, props);
    return createElement(Component, props);
  };

  Guarded.displayName = `${componentName}Boundary(${displayName})`;
  return Guarded;
};

export const TABLE_COMPONENT_CONTRACT = [
  { name: 'players', required: true, type: 'array' },
  { name: 'userId', required: true, type: 'string' },
  { name: 'phase', required: true, type: 'string' },
  { name: 'hand', required: true, type: 'array' },
  { name: 'handLocked', required: true, type: 'boolean' },
  { name: 'onPlayCard', required: true, type: 'function' },
];

export const LOBBY_COMPONENT_CONTRACT = [
  { name: 'players', required: true, type: 'array' },
  { name: 'hostId', required: true, type: 'string' },
  { name: 'userId', required: true, type: 'string' },
  { name: 'onStart', required: true, type: 'function' },
  { name: 'onReturnToWelcome', required: true, type: 'function' },
  { name: 'onBackToHub', required: true, type: 'function' },
];
