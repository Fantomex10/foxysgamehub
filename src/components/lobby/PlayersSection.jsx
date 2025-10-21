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

export const PlayersSection = ({ players, userId, isCompact }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;

  const listStyle = useMemo(() => {
    if (isCompact) {
      return {
        display: 'grid',
        gap: '6px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        justifyItems: 'stretch',
      };
    }
    return {
      display: 'grid',
      gap: '8px',
      gridTemplateColumns: 'repeat(2, minmax(0, 180px))',
      justifyContent: 'center',
      justifyItems: 'stretch',
      maxWidth: '380px',
      margin: '0 auto',
    };
  }, [isCompact]);

  const playerRowStyle = (isSelf, isReady) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 9px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${isSelf ? theme.colors.accentPrimary : theme.colors.borderSubtle}`,
    background: isReady ? theme.colors.accentSuccessSoft : theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    minWidth: 0,
    width: '100%',
    minHeight: '52px',
    boxSizing: 'border-box',
  });

  const playerInfoStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
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

  return (
    <section>
      <div style={listStyle}>
        {players.map((player) => {
          const metaLabels = [];
          if (player.id === userId) metaLabels.push('You');
          if (player.isHost) metaLabels.push('Host');
          if (player.isBot) metaLabels.push('Bot');
          const status = getPlayerStatus(player);
          return (
            <div key={player.id} style={playerRowStyle(player.id === userId, player.isReady)}>
              <div style={playerInfoStyle}>
                <p style={nameStyle}>{player.name}</p>
                {metaLabels.length > 0 && <p style={metaStyle}>{metaLabels.join(' | ')}</p>}
              </div>
              <StatusControl
                status={status}
                interactive={false}
                playerName={player.name}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
