import { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';
import { StatusControl } from './StatusControl.jsx';

const getPlayerStatus = (player) => {
  if (['notReady', 'ready', 'needsTime'].includes(player.status)) {
    return player.status;
  }
  return player.isReady ? 'ready' : 'notReady';
};

export const PlayersSection = ({
  players,
  userId,
  seatCapacity,
  isHost,
  isCompact,
  gameSelectId,
  gameOptions,
  currentGameId,
  showGameSelect,
  onSelectGame,
  onSetStatus,
  onCycleStatus,
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const headerStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: isCompact ? theme.spacing.sm : theme.spacing.md,
    flexWrap: 'wrap',
    marginBottom: isCompact ? theme.spacing.xs : theme.spacing.sm,
  }), [isCompact, theme]);

  const listStyle = useMemo(() => ({
    display: 'grid',
    gap: theme.spacing.sm,
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  }), [theme]);

  const playerRowStyle = useMemo(() => (
    (isSelf, isReady) => ({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      borderRadius: theme.radii.sm,
      border: `1px solid ${isSelf ? theme.colors.accentPrimary : theme.colors.borderSubtle}`,
      background: isReady ? theme.colors.accentSuccessSoft : theme.colors.surfaceMuted,
      color: theme.colors.textPrimary,
      minWidth: 0,
    })
  ), [theme]);

  const playerInfoStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    flex: '1 1 auto',
    minWidth: 0,
  }), []);

  const nameStyle = useMemo(() => ({
    margin: 0,
    fontSize: scaleFont('15px', fontScale),
    fontWeight: 600,
    color: theme.colors.textPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }), [theme, fontScale]);

  const metaStyle = useMemo(() => ({
    margin: 0,
    fontSize: scaleFont('11px', fontScale),
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }), [theme, fontScale]);

  const selectWrapperStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginLeft: 'auto',
  }), [theme]);

  const selectStyle = useMemo(() => ({
    padding: isCompact ? '6px 8px' : '6px 10px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('13px', fontScale),
    fontWeight: 500,
    cursor: 'pointer',
  }), [isCompact, theme, fontScale]);

  return (
    <section>
      <div style={headerStyle}>
        <h3
          style={{
            margin: 0,
            fontSize: scaleFont('17px', fontScale),
            color: theme.colors.textSecondary,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Players ({players.length}/{seatCapacity})
        </h3>
        {showGameSelect && (
          <div style={selectWrapperStyle}>
            <span
              style={{
                fontSize: scaleFont('10px', fontScale),
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: theme.colors.textMuted,
              }}
            >
              Game
            </span>
            <select
              id={gameSelectId}
              value={currentGameId}
              onChange={(event) => onSelectGame?.(event.target.value)}
              style={selectStyle}
              aria-label="Select game"
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={listStyle}>
        {players.map((player) => {
          const metaLabels = [];
          if (player.id === userId) metaLabels.push('You');
          if (player.isHost) metaLabels.push('Host');
          if (player.isBot) metaLabels.push('Bot');
          const status = getPlayerStatus(player);
          const canChangeStatus = player.id === userId || (isHost && player.isBot);

          const handleSelect = (nextStatus) => {
            if (!canChangeStatus || !onSetStatus) return;
            onSetStatus(player.id, nextStatus);
          };

          const handleCycle = () => {
            if (!canChangeStatus) return;
            onCycleStatus?.(player.id);
          };

          return (
            <div key={player.id} style={playerRowStyle(player.id === userId, player.isReady)}>
              <div style={playerInfoStyle}>
                <p style={nameStyle}>{player.name}</p>
                {metaLabels.length > 0 && <p style={metaStyle}>{metaLabels.join(' | ')}</p>}
              </div>
              <StatusControl
                status={status}
                interactive={canChangeStatus}
                onSelect={onSetStatus ? handleSelect : null}
                onCycle={!onSetStatus ? handleCycle : null}
                playerName={player.name}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
