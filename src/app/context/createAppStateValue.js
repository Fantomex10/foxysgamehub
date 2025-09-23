export const createAppStateValue = ({
  engine,
  setEngine,
  engines,
  gameOptions,
  photon,
  photonStatus,
  authUser,
  authReady,
  appPhase,
  setAppPhase,
  availableRooms,
  profileBlocked,
  profileLoaded,
  state,
  interaction,
  roomActions,
  serviceConfig,
  sessionAdapters,
  photonAdapters,
  updateServiceConfig,
  engineModules,
}) => {
  const lobbyModule = engineModules.lobby ?? {};
  const tableModule = engineModules.table ?? {};
  const welcomeModule = engineModules.welcome ?? {};

  const LobbyComponent = lobbyModule.Component ?? (() => null);
  const TableComponent = tableModule.Component;
  const WelcomeComponent = welcomeModule.Component ?? (() => null);

  const hand = interaction.hand ?? (state.hands?.[state.userId] ?? []);
  const handLocked = interaction.handLocked ?? false;
  const onPlayCard = interaction.onPlayCard
    ?? ((card) => photon.playCard(state.userId, card));
  const overlays = interaction.overlays ?? null;

  const playerDisplayName = authUser?.displayName?.trim()
    || state.userName
    || 'Player';
  const gameDisplayName = state.roomName || engine.name;

  return {
    engine,
    setEngine,
    engines,
    gameOptions,
    photon,
    photonStatus,
    authUser,
    authReady,
    appPhase,
    setAppPhase,
    availableRooms,
    profileBlocked,
    profileLoaded,
    state,
    hand,
    handLocked,
    onPlayCard,
    overlays,
    playerDisplayName,
    gameDisplayName,
    LobbyComponent,
    TableComponent,
    WelcomeComponent,
    engineModules,
    roomActions,
    serviceConfig,
    availableSessionAdapters: sessionAdapters,
    availablePhotonAdapters: photonAdapters,
    updateServiceConfig,
  };
};
