import StatusControl from './StatusControl.jsx';
import { useLobbyTokens } from './utils.js';

const playerInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  minWidth: 0,
};

const PlayerList = ({
  players,
  benchList,
  userId,
  onSetStatus,
  onCycleStatus,
  isHost,
}) => {
  const { theme, pieces, scaleFont } = useLobbyTokens();

  const playerRowFor = (isSelf, isReady) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: theme.radii.sm,
    background: isReady ? theme.colors.accentSuccessSoft : theme.colors.surfaceMuted,
    border: `1px solid ${isSelf ? (pieces.primary ?? theme.colors.accentPrimary) : theme.colors.borderSubtle}`,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('14px'),
  });

  const playerNameStyles = {
    margin: 0,
    fontSize: scaleFont('15px'),
    fontWeight: 600,
    color: theme.colors.textPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const playerMetaStyles = {
    margin: 0,
    fontSize: scaleFont('11px'),
    color: theme.colors.textMuted,
  };

  const benchRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 8px',
    borderRadius: '10px',
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('13px'),
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {players.map((player) => {
          const metaLabels = [];
          if (player.id === userId) metaLabels.push('You');
          if (player.isHost) metaLabels.push('Host');
          if (player.isBot) metaLabels.push('Bot');
          const status = ['notReady', 'ready', 'needsTime'].includes(player.status)
            ? player.status
            : (player.isReady ? 'ready' : 'notReady');
          const canChangeStatus = player.id === userId || (isHost && player.isBot);

          const handleStatusSelect = (nextStatus) => {
            if (!canChangeStatus || !onSetStatus) return;
            onSetStatus(player.id, nextStatus);
          };

          const handleStatusCycle = () => {
            if (!canChangeStatus || !onCycleStatus) return;
            onCycleStatus(player.id);
          };

          return (
            <div key={player.id} style={playerRowFor(player.id === userId, player.isReady)}>
              <div style={playerInfoStyle}>
                <p style={playerNameStyles}>{player.name}</p>
                {metaLabels.length > 0 && <p style={playerMetaStyles}>{metaLabels.join(' · ')}</p>}
              </div>
              <StatusControl
                status={status}
                interactive={canChangeStatus}
                onSelect={onSetStatus ? handleStatusSelect : null}
                onCycle={!onSetStatus ? handleStatusCycle : null}
                playerName={player.name}
              />
            </div>
          );
        })}
      </div>

      {benchList.length > 0 && (
        <section style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '4px', fontSize: scaleFont('17px'), color: theme.colors.textSecondary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Spectator bench ({benchList.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {benchList.map((spectator) => {
              const metaLabels = [];
              if (spectator.id === userId) metaLabels.push('You');
              if (spectator.isHost) metaLabels.push('Host');
              if (spectator.isBot) metaLabels.push('Bot');
              metaLabels.push('Spectator');
              return (
                <div key={spectator.id} style={benchRowStyle}>
                  <div style={playerInfoStyle}>
                    <p style={playerNameStyles}>{spectator.name}</p>
                    <p style={playerMetaStyles}>{metaLabels.join(' · ')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
};

export default PlayerList;
