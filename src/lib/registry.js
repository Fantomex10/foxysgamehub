const defaultGetKey = (item, options = {}) => {
  if (options.key) {
    return options.key;
  }
  if (item && typeof item.id === 'string' && item.id.length > 0) {
    return item.id;
  }
  return null;
};

const ensureKey = (candidate, name) => {
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }
  throw new Error(`Attempted to register ${name} without a valid id.`);
};

export const createRegistry = ({
  name = 'item',
  getKey = defaultGetKey,
} = {}) => {
  const entries = new Map();
  let defaultKey = null;

  const register = (value, options = {}) => {
    const key = ensureKey(getKey(value, options), name);
    const replace = Boolean(options.replace ?? options.override);

    if (entries.has(key) && !replace) {
      throw new Error(`Cannot register ${name} "${key}" because it already exists.`);
    }

    entries.set(key, value);

    const shouldSetDefault = options.default === true
      || (defaultKey === null && options.default !== false);

    if (shouldSetDefault) {
      defaultKey = key;
    }

    return value;
  };

  const registerMany = (values = [], options) => {
    values.forEach((value) => register(value, options));
  };

  const unregister = (key) => {
    if (!entries.has(key)) {
      return false;
    }
    entries.delete(key);
    if (defaultKey === key) {
      defaultKey = entries.keys().next().value ?? null;
    }
    return true;
  };

  const get = (key) => {
    if (key && entries.has(key)) {
      return entries.get(key);
    }
    if (defaultKey && entries.has(defaultKey)) {
      return entries.get(defaultKey);
    }
    return null;
  };

  const has = (key) => entries.has(key);

  const list = () => Array.from(entries.values());

  const keys = () => Array.from(entries.keys());

  const setDefault = (key) => {
    if (!entries.has(key)) {
      throw new Error(`Cannot set default ${name}; id "${key}" not registered.`);
    }
    defaultKey = key;
  };

  const getDefaultKey = () => defaultKey;

  const clear = () => {
    entries.clear();
    defaultKey = null;
  };

  const size = () => entries.size;

  return {
    register,
    registerMany,
    unregister,
    get,
    has,
    list,
    keys,
    setDefault,
    getDefaultKey,
    clear,
    size,
  };
};

