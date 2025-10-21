import { useCallback, useMemo } from 'react';
import { useSeatManagerActions } from './useSeatManagerActions.js';

const availableGamesFrom = (gameOptions) => (Array.isArray(gameOptions) ? gameOptions : []);

const resolveCurrentGameId = (selectedGameId, options) => {
  if (selectedGameId && options.some((option) => option.id === selectedGameId)) {
    return selectedGameId;
  }
  return options[0]?.id ?? '';
};

const shouldShowGameSelect = (isHost, options, onSelectGame) => (
  isHost && options.length > 0 && typeof onSelectGame === 'function'
);

const benchListFrom = (spectators) => (Array.isArray(spectators) ? spectators : []);

const seatCapacityFrom = (roomSettings, players) => roomSettings?.maxPlayers ?? players.length;

export const useLobbyOrchestration = ({
  roomId,
  players,
  spectators = [],
  hostId,
  userId,
  gameOptions,
  selectedGameId,
  roomSettings,
  onSelectGame,
  onUpdateSeats,
}) => {
  const isHost = hostId === userId;

  const readyCount = useMemo(
    () => players.filter((player) => player.isReady).length,
    [players],
  );

  const canStart = isHost && players.length >= 2 && readyCount === players.length;

  const availableGames = useMemo(
    () => availableGamesFrom(gameOptions),
    [gameOptions],
  );

  const currentGameId = useMemo(
    () => resolveCurrentGameId(selectedGameId, availableGames),
    [selectedGameId, availableGames],
  );

  const showGameSelect = shouldShowGameSelect(isHost, availableGames, onSelectGame);

  const handleGameSelection = useCallback(
    (nextId) => {
      if (!showGameSelect) return;
      if (!nextId || nextId === currentGameId) return;
      onSelectGame?.(nextId);
    },
    [showGameSelect, currentGameId, onSelectGame],
  );

  const seatCapacity = useMemo(
    () => seatCapacityFrom(roomSettings, players),
    [roomSettings, players],
  );

  const benchList = useMemo(
    () => benchListFrom(spectators),
    [spectators],
  );

  const {
    seatManagerEnabled,
    seatManagerOpen,
    openSeatManager,
    closeSeatManager,
    handleSeatManagerApply,
  } = useSeatManagerActions({ isHost, onUpdateSeats });

  const gameSelectId = useMemo(
    () => (roomId ? `lobby-game-select-${roomId}` : 'lobby-game-select'),
    [roomId],
  );

  return {
    isHost,
    canStart,
    availableGames,
    currentGameId,
    showGameSelect,
    handleGameSelection,
    seatCapacity,
    benchList,
    seatManagerOpen,
    seatManagerEnabled,
    openSeatManager,
    closeSeatManager,
    handleSeatManagerApply,
    gameSelectId,
  };
};
