import { useMemo } from 'react';
import { AppLayout } from '../components/AppLayout.jsx';
import { useAppState } from '../context/AppStateContext.jsx';
import { useCustomizationTokens } from '../../customization/CustomizationContext.jsx';
import { createStatusMessageStyle } from '../../ui/stylePrimitives.js';

export const RoomPage = () => {
  const {
    state,
    gameOptions,
    engine,
    roomActions,
    playerDisplayName,
    gameDisplayName,
    hand,
    handLocked,
    onPlayCard,
    overlays,
    LobbyComponent,
    TableComponent,
    engineModules,
  } = useAppState();
  const { theme, scaleFont } = useCustomizationTokens();
  const statusPadding = `${theme.spacing?.xxl ?? '48px'} ${theme.spacing?.xl ?? '24px'}`;
  const pendingStatusStyle = useMemo(
    () => createStatusMessageStyle({ theme, scaleFont }, { padding: statusPadding }),
    [theme, scaleFont, statusPadding],
  );
  const dangerStatusStyle = useMemo(
    () => createStatusMessageStyle({ theme, scaleFont }, { tone: 'danger', padding: theme.spacing?.xxl ?? '48px' }),
    [theme, scaleFont],
  );

  if (state.phase === 'idle') {
    return (
      <AppLayout
        breadcrumbs="Loading"
        hideMenuToggle
        hideProfileToggle
      >
        <div style={pendingStatusStyle}>
          Preparing lobby…
        </div>
      </AppLayout>
    );
  }

  if (state.phase === 'roomLobby') {
    const lobbyModule = engineModules?.lobby ?? {};
    const lobbyModuleContext = {
      state,
      engine,
      gameOptions,
      roomActions,
      playerDisplayName,
      gameDisplayName,
    };
    const lobbyMenuSections = lobbyModule.getMenuSections
      ? lobbyModule.getMenuSections(lobbyModuleContext)
      : undefined;
    const lobbyProfileSections = lobbyModule.getProfileSections
      ? lobbyModule.getProfileSections(lobbyModuleContext)
      : undefined;
    const lobbyRoomInfo = lobbyModule.getRoomInfo
      ? lobbyModule.getRoomInfo({ state, engine, fallbackName: gameDisplayName })
      : {
        title: state.roomName ?? 'Friendly match',
        code: state.roomId ?? '—',
      };

    return (
      <AppLayout
        menuSections={lobbyMenuSections}
        profileSections={lobbyProfileSections}
        roomInfo={lobbyRoomInfo}
      >
        <LobbyComponent
          roomId={state.roomId}
          roomName={state.roomName}
          players={state.players}
          spectators={state.spectators ?? []}
          hostId={state.hostId}
          userId={state.userId}
          banner={state.banner}
          gameOptions={gameOptions}
          selectedGameId={engine.id}
          seatRules={engine.metadata?.playerConfig}
          roomSettings={state.roomSettings}
          onSelectGame={roomActions.quickSelectGame}
          onCycleStatus={(playerId) => roomActions.toggleReady(playerId)}
          onSetStatus={(playerId, nextStatus) => roomActions.setPlayerStatus(playerId, nextStatus)}
          onUpdateSeats={(layout) => roomActions.updateSeatLayout(layout)}
          onStart={roomActions.startGame}
          onAddBot={roomActions.addBot}
          onRemoveBot={roomActions.removeBot}
          onReturnToWelcome={roomActions.resetSession}
          onBackToHub={roomActions.returnToHub}
          onConfigureTable={() => {}}
        />
      </AppLayout>
    );
  }

  const tableModule = engineModules?.table ?? {};
  const tableModuleContext = {
    state,
    engine,
    roomActions,
    playerDisplayName,
    gameDisplayName,
    gameOptions,
  };
  const tableMenuSections = tableModule.getMenuSections
    ? tableModule.getMenuSections(tableModuleContext)
    : undefined;
  const tableProfileSections = tableModule.getProfileSections
    ? tableModule.getProfileSections(tableModuleContext)
    : undefined;
  const tableRoomInfo = tableModule.getRoomInfo
    ? tableModule.getRoomInfo({ state, engine, fallbackName: gameDisplayName })
    : {
      title: state.roomName ?? 'Friendly match',
      code: state.roomId ?? '—',
    };

  return (
    <AppLayout
      menuSections={tableMenuSections}
      profileSections={tableProfileSections}
      roomInfo={tableRoomInfo}
    >
      <>
        {TableComponent ? (
          <TableComponent
            roomId={state.roomId}
            roomName={state.roomName}
            players={state.players}
            userId={state.userId}
            hostId={state.hostId}
            phase={state.phase}
            drawPile={state.drawPile}
            discardPile={state.discardPile}
            activeSuit={state.activeSuit}
            hand={hand}
            history={state.history}
            currentTurn={state.currentTurn}
            handLocked={handLocked}
            trick={state.trick}
            lastTrick={state.lastTrick}
            scores={state.scores}
            roundScores={state.roundScores}
            heartsBroken={state.heartsBroken}
            gameOver={state.gameOver}
            onPlayCard={onPlayCard}
            onDrawCard={roomActions.drawCard}
            onStartRound={roomActions.startGame}
          />
        ) : (
          <div style={dangerStatusStyle}>
            Engine "{engine.name}" is missing a Table component.
          </div>
        )}

        {overlays}
      </>
    </AppLayout>
  );
};
