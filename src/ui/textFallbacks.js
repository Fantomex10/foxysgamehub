const trimText = (value) => (typeof value === 'string' ? value.trim() : '');

export const getRoomTitle = (value, fallback = 'Friendly match') => {
  const trimmed = trimText(value);
  return trimmed.length > 0 ? trimmed : fallback;
};

export const getRoomCode = (value) => {
  const trimmed = trimText(value);
  return trimmed.length > 0 ? trimmed.toUpperCase() : 'Pending';
};

export const getDisplayName = (value, fallback = 'Player') => {
  const trimmed = trimText(value);
  return trimmed.length > 0 ? trimmed : fallback;
};

export const getLobbyCategory = (visibility) => {
  const trimmed = trimText(visibility).toLowerCase();
  if (trimmed === 'private') return 'Custom lobby';
  if (trimmed === 'public') return 'Game lobby';
  if (trimmed.length > 0) {
    return trimmed.replace(/^\w/, (char) => char.toUpperCase());
  }
  return 'Game lobby';
};

export const getWaitingStatus = () => 'Waiting for players to ready up...';

export const getLocalTimePlaceholder = () => 'Syncing clock';

export const getBalancePlaceholder = () => 'Not tracked';

export const getCurrentTurnPlaceholder = () => 'Assigning turn';
