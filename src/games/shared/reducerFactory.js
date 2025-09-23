export const createReducer = (actionMap) => {
  if (!actionMap || typeof actionMap !== 'object') {
    throw new TypeError('createReducer requires an action map object');
  }

  return (state, action = {}) => {
    const type = action?.type;
    const handler = typeof type === 'string' ? actionMap[type] : undefined;
    if (typeof handler !== 'function') {
      return state;
    }
    return handler(state, action);
  };
};

export const createInitialStateFactory = (baseStateBuilder) => {
  if (typeof baseStateBuilder !== 'function') {
    throw new TypeError('createInitialStateFactory requires a base state builder function');
  }

  return ({ userId, userName } = {}) => {
    const baseState = baseStateBuilder();
    if (userId) {
      baseState.userId = userId;
    }
    if (typeof userName === 'string') {
      baseState.userName = userName;
    }
    return baseState;
  };
};
