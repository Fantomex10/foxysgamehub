import { useMemo } from 'react';
import { useLobbyTokens } from './utils.js';

const headerRowStyle = (isCompact) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: isCompact ? '6px' : '12px',
  flexWrap: 'wrap',
  marginBottom: isCompact ? '4px' : '8px',
});

const gameSelectWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginLeft: 'auto',
};

const LobbyHeader = ({
  playerCount,
  seatCapacity,
  canSelectGame,
  availableGames,
  currentGameId,
  onSelectGame,
  isCompactLayout,
}) => {
  const { theme, scaleFont } = useLobbyTokens();

  const selectStyle = useMemo(() => ({
    padding: isCompactLayout ? '6px 8px' : '6px 10px',
    borderRadius: '10px',
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('13px'),
    fontWeight: 500,
    cursor: 'pointer',
  }), [isCompactLayout, theme, scaleFont]);

  const labelStyle = useMemo(() => ({
    fontSize: scaleFont('10px'),
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  }), [theme, scaleFont]);

  return (
    <div style={{ ...headerRowStyle(isCompactLayout), color: theme.colors.textPrimary }}>
      <h3 style={{ margin: 0, fontSize: scaleFont('17px'), color: theme.colors.textSecondary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Players ({playerCount}/{seatCapacity})
      </h3>
      {canSelectGame && (
        <div style={gameSelectWrapperStyle}>
          <span style={labelStyle}>Game</span>
          <select
            value={currentGameId}
            onChange={(event) => onSelectGame?.(event.target.value)}
            style={selectStyle}
            aria-label="Select game"
          >
            {availableGames.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LobbyHeader;
