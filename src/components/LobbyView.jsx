import { useMemo } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';
import { getWaitingStatus } from '../ui/textFallbacks.js';
import { SeatManagerDialog } from './lobby/SeatManagerDialog.jsx';
import { PlayersSection } from './lobby/PlayersSection.jsx';
import { SpectatorSection } from './lobby/SpectatorSection.jsx';
import { HostControls } from './lobby/HostControls.jsx';
import { LobbyBanner } from './lobby/LobbyBanner.jsx';
import { FooterActions } from './lobby/FooterActions.jsx';
import { useLobbyOrchestration } from './lobby/useLobbyOrchestration.js';

const DEFAULT_BANNER = getWaitingStatus();

const containerStyle = (theme, isCompact) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.lg,
  padding: isCompact ? theme.spacing.md : theme.spacing.lg,
  borderRadius: theme.radii.lg,
  background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`,
  boxShadow: theme.shadows.panel,
  boxSizing: 'border-box',
});

const LobbyView = ({
  roomId,
  roomName,
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
  onCycleStatus,
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
  const isCompactLayout = useMediaQuery('(max-width: 600px)');

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

  const containerStyles = useMemo(
    () => containerStyle(theme, isCompactLayout),
    [theme, isCompactLayout],
  );

  const shouldShowBanner = Boolean(banner && banner !== DEFAULT_BANNER);

  return (
    <div style={containerStyles}>
      <header>
        <h2
          style={{
            margin: 0,
            color: theme.colors.textPrimary,
            fontSize: scaleFont('22px', fontScale),
          }}
        >
          {roomName ?? 'Friendly match'}
        </h2>
      </header>

      <PlayersSection
        players={players}
        userId={userId}
        seatCapacity={seatCapacity}
        isHost={isHost}
        isCompact={isCompactLayout}
        gameSelectId={gameSelectId}
        gameOptions={availableGames}
        currentGameId={currentGameId}
        showGameSelect={showGameSelect}
        onSelectGame={handleGameSelection}
        onSetStatus={onSetStatus}
        onCycleStatus={onCycleStatus}
      />

      <SpectatorSection spectators={benchList} userId={userId} />

      {shouldShowBanner && <LobbyBanner banner={banner} />}

      {isHost && (
        <HostControls
          canStart={canStart}
          onStart={onStart}
          onAddBot={onAddBot}
          onRemoveBot={onRemoveBot}
          seatManagerEnabled={seatManagerEnabled}
          onSeatManagerOpen={openSeatManager}
          onConfigureTable={onConfigureTable}
        />
      )}

      <FooterActions
        isHost={isHost}
        onReset={onReturnToWelcome}
        onBack={onBackToHub}
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
