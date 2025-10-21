import { useMemo } from 'react';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { getWaitingStatus } from '../ui/textFallbacks.js';
import { SeatManagerDialog } from './lobby/SeatManagerDialog.jsx';
import { PlayersSection } from './lobby/PlayersSection.jsx';
import { SpectatorSection } from './lobby/SpectatorSection.jsx';
import { LobbyBanner } from './lobby/LobbyBanner.jsx';
import { useLobbyOrchestration } from './lobby/useLobbyOrchestration.js';
import { useLobbyActions } from './lobby/useLobbyActions.js';
import { LobbyActionGrid } from './lobby/LobbyActionGrid.jsx';
import { LobbyHeader } from './lobby/LobbyHeader.jsx';
import { SeatManagerSummary } from './lobby/SeatManagerSummary.jsx';

const DEFAULT_BANNER = getWaitingStatus();

const containerStyle = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.lg,
  padding: theme.spacing.md,
  position: 'relative',
  borderRadius: theme.radii.lg,
  background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`,
  boxShadow: theme.shadows.panel,
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '540px',
  margin: '0 auto',
  alignItems: 'stretch',
});

const LobbyView = ({
  roomId,
  players,
  spectators = [],
  hostId,
  userId,
  banner,
  gameOptions,
  selectedGameId,
  seatRules,
  roomSettings,
  onSelectGame,
  onSetStatus,
  onUpdateSeats,
  onStart,
  onAddBot,
  onRemoveBot,
  onReturnToWelcome,
  onBackToHub,
  onConfigureTable,
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = Boolean(accessibility?.prefersReducedMotion);
  const isCompactLayout = true;

  const getPlayerStatus = (player) => {
    if (!player) return 'notReady';
    const { status, isReady } = player;
    if (['notReady', 'ready', 'needsTime'].includes(status)) {
      return status;
    }
    return isReady ? 'ready' : 'notReady';
  };

  const {
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
  } = useLobbyOrchestration({
    roomId,
    players,
    spectators,
    hostId,
    userId,
    gameOptions,
    selectedGameId,
    roomSettings,
    onSelectGame,
    onUpdateSeats,
  });

  const selfPlayer = players.find((player) => player.id === userId);
  const selfStatus = getPlayerStatus(selfPlayer);

  const containerStyles = useMemo(
    () => containerStyle(theme),
    [theme],
  );

  const canChangeOwnStatus = Boolean(onSetStatus && userId);

  const { primaryActions, secondaryActions } = useLobbyActions({
    userId,
    selfStatus,
    canChangeOwnStatus,
    isHost,
    seatManagerEnabled,
    openSeatManager,
    onSetStatus,
    onAddBot,
    onRemoveBot,
    onAddPlayerSlot: undefined,
    onRemovePlayerSlot: undefined,
    onStart,
    onConfigureTable,
    onReturnToWelcome,
    onBackToHub,
    canStart,
  });

  const shouldShowBanner = Boolean(banner && banner !== DEFAULT_BANNER);

  return (
    <div style={containerStyles}>
      <LobbyHeader
        playerCount={players.length}
        seatCapacity={seatCapacity}
        isCompact={isCompactLayout}
        gameSelectId={gameSelectId}
        gameOptions={availableGames}
        currentGameId={currentGameId}
        showGameSelect={showGameSelect}
        onSelectGame={handleGameSelection}
      />

      <PlayersSection
        players={players}
        userId={userId}
        isCompact={isCompactLayout}
      />

      <SpectatorSection spectators={benchList} userId={userId} />

      {shouldShowBanner && <LobbyBanner banner={banner} />}

      <LobbyActionGrid
        actions={primaryActions}
        columns={4}
        isCompact={isCompactLayout}
        theme={theme}
        fontScale={fontScale}
        prefersReducedMotion={prefersReducedMotion}
        variant="primary"
      />

      <LobbyActionGrid
        actions={secondaryActions}
        columns={2}
        isCompact={isCompactLayout}
        theme={theme}
        fontScale={fontScale}
        prefersReducedMotion={prefersReducedMotion}
        variant="secondary"
      />

      <SeatManagerSummary
        seatCapacity={seatCapacity}
        players={players}
        benchList={benchList}
        seatManagerEnabled={seatManagerEnabled}
      />

      {seatManagerEnabled && (
        <SeatManagerDialog
          open={seatManagerOpen}
          onClose={closeSeatManager}
          onApply={handleSeatManagerApply}
          players={players}
          spectators={benchList}
          hostId={hostId}
          userId={userId}
          seatRules={seatRules}
          roomSettings={roomSettings}
        />
      )}
    </div>
  );
};

export default LobbyView;
