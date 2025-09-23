export const handleSetName = (state, action) => {
  const { payload } = action ?? {};
  const nextName = typeof payload === 'string'
    ? payload.trim()
    : payload?.trim?.() ?? '';
  return {
    ...state,
    userName: nextName ?? '',
  };
};
