import LobbyView from '../../components/LobbyView.jsx';
import WelcomeScreen from '../../components/WelcomeScreen.jsx';
import {
  LOBBY_COMPONENT_CONTRACT,
  TABLE_COMPONENT_CONTRACT,
  wrapEngineComponent,
} from './engineComponentGuard.js';

const defaultRoomInfo = ({ state, fallbackName = 'Friendly match' }) => ({
  title: state.roomName ?? fallbackName,
  code: state.roomId ?? '—',
});

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
  { type: 'highlight', label: 'Lobby', value: state.roomName ?? gameDisplayName },
  { label: 'Room code', value: state.roomId ?? '—' },
  { label: 'Status', value: state.banner || 'Waiting for players to ready up…' },
  { label: 'Spectators', value: String(state.spectators?.length ?? 0) },
  { label: 'Local time', value: '--:--' },
  { type: 'divider', key: 'lobby-divider' },
  { label: 'Display name', value: playerDisplayName },
  { label: 'Lobby notes', value: 'Share the code with friends to invite them.' },
]);

const defaultTableMenuSections = ({ roomActions }) => ([
  {
    title: 'Session controls',
    items: [
      { label: 'Return to lobby', onClick: roomActions.returnToLobby, tone: 'primary' },
      { label: 'Reset match', onClick: roomActions.resetSession, tone: 'danger' },
      { label: 'Main menu', onClick: roomActions.returnToHub, tone: 'ghost' },
    ],
  },
  {
    title: 'Table tools',
    items: [
      { label: 'Table options', onClick: () => {}, tone: 'ghost' },
      { label: 'Support', onClick: () => {}, tone: 'ghost' },
    ],
  },
]);

const defaultTableProfileSections = ({ state, gameDisplayName, playerDisplayName }) => {
  const currentPlayerName = state.players?.find((player) => player.id === state.currentTurn)?.name ?? '—';
  return [
    { type: 'highlight', label: 'Lobby', value: state.roomName ?? gameDisplayName },
    { label: 'Room code', value: state.roomId ?? '—' },
    { label: 'Current turn', value: currentPlayerName },
    { label: 'Status', value: state.banner || 'Game in progress' },
    { type: 'divider', key: 'table-divider' },
    { label: 'Display name', value: playerDisplayName },
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

  const guardedLobbyModule = {
    ...lobbyModule,
    Component: lobbyModule.Component
      ? wrapEngineComponent('Lobby', lobbyModule.Component, LOBBY_COMPONENT_CONTRACT)
      : lobbyModule.Component,
  };

  const guardedTableModule = {
    ...tableModule,
    Component: tableModule.Component
      ? wrapEngineComponent('Table', tableModule.Component, TABLE_COMPONENT_CONTRACT)
      : tableModule.Component,
  };

  return {
    welcome: {
      Component: welcomeComponent,
      ...modules.welcome,
    },
    lobby: guardedLobbyModule,
    table: guardedTableModule,
  };
};
