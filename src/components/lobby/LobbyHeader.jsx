import React, { useMemo } from 'react';
import { useCustomizationTokens } from '../../customization/useCustomization.js';
import { scaleFont } from '../../ui/typography.js';

const PlayersIcon = ({ color }) => (
  <svg
    width="22"
    height="16"
    viewBox="0 0 22 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M7 7.5C8.933 7.5 10.5 5.933 10.5 4S8.933 0.5 7 0.5 3.5 2.067 3.5 4 5.067 7.5 7 7.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 7.5C16.433 7.5 18 5.933 18 4S16.433 0.5 14.5 0.5 11 2.067 11 4s1.567 3.5 3.5 3.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
    <path
      d="M2 15.5v-1.2c0-2.32 1.88-4.3 4.2-4.3h1.6c2.32 0 4.2 1.98 4.2 4.3v1.2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 15.5v-1c0-2 1.6-3.6 3.6-3.6h1.3c2 0 3.6 1.6 3.6 3.6v1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
  </svg>
);

export const LobbyHeader = ({
  playerCount,
  seatCapacity,
  isCompact,
  gameSelectId,
  gameOptions,
  currentGameId,
  showGameSelect,
  onSelectGame,
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const halfSpacingXs = useMemo(() => {
    const raw = theme.spacing?.xs;
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return `${Math.max(raw / 2, 2)}px`;
    }
    if (typeof raw === 'string') {
      const numeric = parseFloat(raw);
      const unit = raw.replace(/[-0-9.]/g, '') || 'px';
      if (Number.isFinite(numeric)) {
        return `${Math.max(numeric / 2, 2)}${unit}`;
      }
    }
    return '4px';
  }, [theme.spacing?.xs]);

  const headerStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: isCompact ? 'auto auto' : 'repeat(2, minmax(0, 1fr))',
      alignItems: 'start',
      gap: halfSpacingXs,
      marginBottom: halfSpacingXs,
      width: '100%',
      maxWidth: isCompact ? '100%' : '360px',
      marginLeft: 'auto',
      marginRight: 'auto',
    }),
    [halfSpacingXs, isCompact],
  );

  const playerCountStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: halfSpacingXs,
      color: theme.colors.textSecondary,
      fontSize: scaleFont('17px', fontScale),
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      lineHeight: 1,
      justifyContent: 'flex-start',
    }),
    [halfSpacingXs, theme, fontScale],
  );

  const playerCountTextStyle = useMemo(
    () => ({
      lineHeight: 1,
      display: 'block',
      marginTop: '2px',
    }),
    [],
  );

  const selectWrapperStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: halfSpacingXs,
      justifyContent: 'flex-end',
    }),
    [halfSpacingXs],
  );

  const selectStyle = useMemo(
    () => ({
      padding: isCompact ? '6px 8px' : '6px 10px',
      borderRadius: theme.radii.sm,
      border: `1px solid ${theme.colors.border}`,
      background: theme.colors.surfaceMuted,
      color: theme.colors.textPrimary,
      fontSize: scaleFont('13px', fontScale),
      fontWeight: 500,
      cursor: 'pointer',
    }),
    [isCompact, theme, fontScale],
  );

  if (!showGameSelect && !seatCapacity) {
    return null;
  }

  return (
    <div style={headerStyle}>
      <div
        style={playerCountStyle}
        aria-label={`Players ${playerCount} of ${seatCapacity ?? playerCount}`}
      >
        <PlayersIcon color={theme.colors.textSecondary} />
        <span style={playerCountTextStyle}>
          {playerCount}/{seatCapacity ?? playerCount}
        </span>
      </div>

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
  );
};
