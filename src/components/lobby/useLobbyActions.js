import { useCallback, useMemo } from 'react';
import {
  FaUserPlus,
  FaUserMinus,
  FaUserClock,
  FaUserTimes,
  FaUserCheck,
  FaChair,
} from 'react-icons/fa';

const noop = () => {};
const ICON_SIZE = 18;
const ROBOT_ICON_SIZE = 18;

const createComponentIcon = (Component, size = ICON_SIZE) => ({
  type: 'component',
  Component,
  size,
});

const createImageIcon = (src, size = ROBOT_ICON_SIZE, alt = '') => ({
  type: 'image',
  src,
  size,
  alt,
});

const wrapHostAction = (isHost, handler) => {
  if (!isHost || typeof handler !== 'function') {
    return undefined;
  }
  return () => handler();
};

export const useLobbyActions = ({
  userId,
  selfStatus,
  canChangeOwnStatus,
  isHost,
  seatManagerEnabled,
  openSeatManager,
  onSetStatus,
  onAddBot,
  onRemoveBot,
  onAddPlayerSlot,
  onRemovePlayerSlot,
  onStart,
  onConfigureTable,
  onReturnToWelcome,
  onBackToHub,
  canStart,
}) => {
  const statusReadyIcon = useMemo(() => createComponentIcon(FaUserCheck), []);
  const statusTimeIcon = useMemo(() => createComponentIcon(FaUserClock), []);
  const statusNotReadyIcon = useMemo(() => createComponentIcon(FaUserTimes), []);
  const seatManagerIcon = useMemo(() => createComponentIcon(FaChair), []);
  const addPlayerIcon = useMemo(() => createComponentIcon(FaUserPlus), []);
  const removePlayerIcon = useMemo(() => createComponentIcon(FaUserMinus), []);
  const addBotIcon = useMemo(
    () => createImageIcon('/robot_plus.png'),
    [],
  );
  const removeBotIcon = useMemo(
    () => createImageIcon('/robot_minus.png'),
    [],
  );

  const handleStatusChange = useCallback(
    (nextStatus) => {
      if (!canChangeOwnStatus || typeof onSetStatus !== 'function' || !userId) {
        return;
      }
      onSetStatus(userId, nextStatus);
    },
    [canChangeOwnStatus, onSetStatus, userId],
  );

  const seatManagerAction = useMemo(
    () => wrapHostAction(isHost && seatManagerEnabled, openSeatManager),
    [isHost, seatManagerEnabled, openSeatManager],
  );

  const addBotAction = useMemo(
    () => wrapHostAction(isHost, onAddBot),
    [isHost, onAddBot],
  );

  const removeBotAction = useMemo(
    () => wrapHostAction(isHost, onRemoveBot),
    [isHost, onRemoveBot],
  );

  const addPlayerSlotAction = useMemo(
    () => wrapHostAction(isHost, onAddPlayerSlot),
    [isHost, onAddPlayerSlot],
  );

  const removePlayerSlotAction = useMemo(
    () => wrapHostAction(isHost, onRemovePlayerSlot),
    [isHost, onRemovePlayerSlot],
  );

  const startGameAction = useMemo(
    () => wrapHostAction(isHost && canStart, onStart),
    [isHost, canStart, onStart],
  );

  const configureTableAction = useMemo(
    () => wrapHostAction(isHost, onConfigureTable),
    [isHost, onConfigureTable],
  );

  const returnToWelcomeAction = useMemo(
    () => wrapHostAction(isHost, onReturnToWelcome) ?? noop,
    [isHost, onReturnToWelcome],
  );

  const backToHubAction = useMemo(() => {
    if (typeof onBackToHub === 'function') {
      return () => onBackToHub();
    }
    return noop;
  }, [onBackToHub]);

  const primaryActions = useMemo(
    () => [
      {
        key: 'ready',
        label: 'Ready',
        icon: statusReadyIcon,
        onClick: () => handleStatusChange('ready'),
        disabled: !canChangeOwnStatus,
        tone: 'success',
        inactiveTone: 'ghost',
        active: selfStatus === 'ready',
      },
      {
        key: 'time',
        label: 'Time',
        icon: statusTimeIcon,
        onClick: () => handleStatusChange('needsTime'),
        disabled: !canChangeOwnStatus,
        tone: 'danger',
        inactiveTone: 'ghost',
        active: selfStatus === 'needsTime',
      },
      {
        key: 'not-ready',
        label: 'Not ready',
        wordSpacing: '-3px',
        icon: statusNotReadyIcon,
        onClick: () => handleStatusChange('notReady'),
        disabled: !canChangeOwnStatus,
        tone: 'warning',
        inactiveTone: 'ghost',
        active: selfStatus === 'notReady',
      },
      {
        key: 'seat-select',
        label: 'Seats',
        icon: seatManagerIcon,
        onClick: seatManagerAction,
        disabled: !seatManagerAction,
        tone: 'secondary',
      },
      {
        key: 'add-bot',
        label: '+ Bot',
        icon: addBotIcon,
        onClick: addBotAction,
        disabled: !addBotAction,
        tone: 'success',
      },
      {
        key: 'remove-bot',
        label: '- Bot',
        icon: removeBotIcon,
        onClick: removeBotAction,
        disabled: !removeBotAction,
        tone: 'danger',
      },
      {
        key: 'add-player-slot',
        label: '+ Player',
        icon: addPlayerIcon,
        onClick: addPlayerSlotAction,
        disabled: !addPlayerSlotAction,
        tone: 'primary',
      },
      {
        key: 'remove-player-slot',
        label: '- Player',
        icon: removePlayerIcon,
        onClick: removePlayerSlotAction,
        disabled: !removePlayerSlotAction,
        tone: 'warning',
      },
    ],
    [
      handleStatusChange,
      canChangeOwnStatus,
      selfStatus,
      seatManagerAction,
      addBotAction,
      removeBotAction,
      addPlayerSlotAction,
      removePlayerSlotAction,
      statusReadyIcon,
      statusTimeIcon,
      statusNotReadyIcon,
      seatManagerIcon,
      addBotIcon,
      removeBotIcon,
      addPlayerIcon,
      removePlayerIcon,
    ],
  );

  const secondaryActions = useMemo(
    () => [
      {
        key: 'start-game',
        label: 'Start game',
        icon: null,
        onClick: startGameAction,
        disabled: !startGameAction,
        tone: 'primary',
        span: 1,
      },
      {
        key: 'table-options',
        label: 'Table options',
        icon: null,
        onClick: configureTableAction,
        disabled: !configureTableAction,
        tone: 'secondary',
        span: 1,
      },
      {
        key: 'reset-lobby',
        label: 'Reset lobby',
        icon: null,
        onClick: returnToWelcomeAction,
        disabled: !isHost || typeof onReturnToWelcome !== 'function',
        tone: 'ghost',
        span: 1,
      },
      {
        key: 'back-to-hub',
        label: 'Back to hub',
        icon: null,
        onClick: backToHubAction,
        disabled: false,
        tone: 'ghost',
        span: 1,
      },
    ],
    [
      startGameAction,
      configureTableAction,
      returnToWelcomeAction,
      backToHubAction,
      isHost,
      onReturnToWelcome,
    ],
  );

  return {
    primaryActions,
    secondaryActions,
  };
};

