import { useMemo, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { LobbyHeader, PlayerList, HostControls, SeatManagerDialog, useLobbyTokens } from './lobby';

const DEFAULT_BANNER = 'Waiting for players to ready up…';

const bannerStyle = (theme, scaleFont) => ({
  background: theme.colors.accentDangerSoft,
  border: `1px solid ${theme.colors.accentDanger}`,
  color: theme.colors.accentDanger,
  padding: '10px 14px',
  borderRadius: theme.radii.sm,
  fontSize: scaleFont('14px'),
});

const LobbyView = ({
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
  const {
    theme,
    scaleFont,
  } = useLobbyTokens();

  const isHost = hostId === userId;
  const readyCount = players.filter((player) => player.isReady).length;
  const canStart = isHost && players.length >= 2 && readyCount === players.length;
  const isCompactLayout = useMediaQuery('(max-width: 600px)');

  const seatCapacity = roomSettings?.maxPlayers ?? players.length;
  const benchList = Array.isArray(spectators) ? spectators : [];

  const containerStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    padding: isCompactLayout ? '16px' : '24px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.xl,
    boxShadow: theme.shadows.panel,
    color: theme.colors.textPrimary,
  }), [theme, isCompactLayout]);

  const availableGames = Array.isArray(gameOptions) ? gameOptions : [];
  const currentGameId = selectedGameId && availableGames.some((game) => game.id === selectedGameId)
    ? selectedGameId
    : (availableGames[0]?.id ?? '');
  const showGameSelect = isHost && availableGames.length > 0 && typeof onSelectGame === 'function';

  const seatManagerEnabled = isHost && typeof onUpdateSeats === 'function';
  const [seatManagerOpen, setSeatManagerOpen] = useState(false);

  const handleSeatManagerApply = (config) => {
    if (!seatManagerEnabled) return;
    const result = onUpdateSeats(config);
    if (result && typeof result.then === 'function') {
      result.finally(() => setSeatManagerOpen(false));
    } else {
      setSeatManagerOpen(false);
    }
  };

  return (
    <div style={containerStyles}>
      <LobbyHeader
        playerCount={players.length}
        seatCapacity={seatCapacity}
        canSelectGame={showGameSelect}
        availableGames={availableGames}
        currentGameId={currentGameId}
        onSelectGame={onSelectGame}
        isCompactLayout={isCompactLayout}
      />

      <PlayerList
        players={players}
        benchList={benchList}
        userId={userId}
        seatCapacity={seatCapacity}
        onSetStatus={onSetStatus}
        onCycleStatus={onCycleStatus}
        isHost={isHost}
      />

      {banner && banner !== DEFAULT_BANNER && (
        <div style={bannerStyle(theme, scaleFont)}>{banner}</div>
      )}

      <HostControls
        isHost={isHost}
        canStart={canStart}
        onAddBot={onAddBot}
        onRemoveBot={onRemoveBot}
        onSeatManager={() => seatManagerEnabled && setSeatManagerOpen(true)}
        onStart={onStart}
        onConfigureTable={onConfigureTable ?? (() => {})}
        onReturnToWelcome={onReturnToWelcome}
        onBackToHub={onBackToHub}
      />

      {seatManagerEnabled && (
        <SeatManagerDialog
          open={seatManagerOpen}
          onClose={() => setSeatManagerOpen(false)}
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
