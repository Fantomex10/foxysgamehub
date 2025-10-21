import LobbyView from '../../components/LobbyView.jsx';
import WelcomeScreen from '../../components/WelcomeScreen.jsx';
import {
  getRoomTitle,
  getRoomCode,
  getDisplayName,
  getWaitingStatus,
  getLocalTimePlaceholder,
  getCurrentTurnPlaceholder,
} from '../../ui/textFallbacks.js';

const defaultRoomInfo = ({ state, fallbackName = 'Friendly match' }) => {
  const rawPassword = state.roomSettings?.password;
  const trimmedPassword = typeof rawPassword === 'string' ? rawPassword.trim() : '';
  const password = trimmedPassword.length > 0 ? trimmedPassword : null;
  const code = getRoomCode(state.roomId);

  return {
    title: getRoomTitle(state.roomName, fallbackName),
    code,
    id: code,
    password,
  };
};

const defaultLobbyMenuSections = ({ roomActions }) => ([
  {
    title: 'Session controls',
    items: [
      { label: 'Main menu', onClick: roomActions.returnToHub, tone: 'primary' },
      { label: 'Reset match', onClick: roomActions.resetSession, tone: 'danger' },
    ],
  },
]);

const defaultLobbyProfileSections = ({ state, gameDisplayName, playerDisplayName }) => ([
  { type: 'highlight', label: 'Lobby', value: getRoomTitle(state.roomName, gameDisplayName) },
  { label: 'Room code', value: getRoomCode(state.roomId) },
  { label: 'Status', value: state.banner || getWaitingStatus() },
  { label: 'Spectators', value: String(state.spectators?.length ?? 0) },
  { label: 'Local time', value: getLocalTimePlaceholder() },
  { type: 'divider', key: 'lobby-divider' },
  { label: 'Display name', value: getDisplayName(playerDisplayName) },
  { label: 'Lobby notes', value: 'Share the code with friends to invite them.' },
]);

const defaultTableMenuSections = ({ roomActions }) => {
  const sections = [
    {
      title: 'Session controls',
      items: [
        { label: 'Return to lobby', onClick: roomActions.returnToLobby, tone: 'primary' },
        { label: 'Reset match', onClick: roomActions.resetSession, tone: 'danger' },
        { label: 'Main menu', onClick: roomActions.returnToHub, tone: 'ghost' },
      ],
    },
  ];

  const tableTools = [
    roomActions?.openTableOptions
      ? { label: 'Table options', onClick: roomActions.openTableOptions, tone: 'ghost' }
      : null,
    roomActions?.openSupport
      ? { label: 'Support', onClick: roomActions.openSupport, tone: 'ghost' }
      : null,
  ].filter(Boolean);

  if (tableTools.length > 0) {
    sections.push({
      title: 'Table tools',
      items: tableTools,
    });
  }

  return sections;
};

const defaultTableProfileSections = ({ state, gameDisplayName, playerDisplayName }) => {
  const currentPlayer = state.players?.find((player) => player.id === state.currentTurn);
  const currentTurnName = currentPlayer
    ? getDisplayName(currentPlayer.name)
    : getCurrentTurnPlaceholder();

  return [
    { type: 'highlight', label: 'Lobby', value: getRoomTitle(state.roomName, gameDisplayName) },
    { label: 'Room code', value: getRoomCode(state.roomId) },
    { label: 'Current turn', value: currentTurnName },
    { label: 'Status', value: state.banner || 'Game in progress' },
    { type: 'divider', key: 'table-divider' },
    { label: 'Display name', value: getDisplayName(playerDisplayName) },
    { label: 'Win streak', value: 'Coming soon' },
    { label: 'Unlocked items', value: 'No items unlocked yet.' },
  ];
};

const normaliseModule = (defaults, overrides = {}) => ({
  ...defaults,
  ...overrides,
  getMenuSections: overrides.getMenuSections ?? defaults.getMenuSections,
  getProfileSections: overrides.getProfileSections ?? defaults.getProfileSections,
  getRoomInfo: overrides.getRoomInfo ?? defaults.getRoomInfo,
  Component: overrides.Component ?? defaults.Component,
});

export const resolveEngineModules = (engine) => {
  const components = engine.components ?? {};
  const modules = engine.modules ?? {};

  const welcomeComponent = modules.welcome?.Component ?? components.Welcome ?? WelcomeScreen;

  const lobbyModule = normaliseModule({
    Component: components.Lobby ?? LobbyView,
    getMenuSections: defaultLobbyMenuSections,
    getProfileSections: defaultLobbyProfileSections,
    getRoomInfo: defaultRoomInfo,
  }, modules.lobby);

  const tableModule = normaliseModule({
    Component: components.Table,
    getMenuSections: defaultTableMenuSections,
    getProfileSections: defaultTableProfileSections,
    getRoomInfo: defaultRoomInfo,
  }, modules.table);

  return {
    welcome: {
      Component: welcomeComponent,
      ...modules.welcome,
    },
    lobby: lobbyModule,
    table: tableModule,
  };
};
