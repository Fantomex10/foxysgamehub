const cardStyle = {
  backgroundColor: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: '24px',
  padding: '40px 32px',
  maxWidth: '720px',
  margin: '0 auto',
  boxShadow: '0 32px 64px rgba(15,23,42,0.65)',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const playerRowStyle = (isSelf, isReady, isHost) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '14px',
  background: isReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148,163,184,0.08)',
  border: `1px solid ${isSelf ? 'rgba(96,165,250,0.45)' : 'rgba(148,163,184,0.15)'}`,
  color: '#f8fafc',
  fontSize: '15px',
  fontWeight: isSelf ? 600 : 500,
});

const buttonStyle = {
  padding: '10px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,118,110,0.45)',
  color: '#f8fafc',
  fontWeight: 600,
  cursor: 'pointer',
};

const subtleButton = {
  padding: '8px 14px',
  borderRadius: '999px',
  border: '1px solid rgba(148,163,184,0.25)',
  background: 'transparent',
  color: '#94a3b8',
  fontSize: '14px',
  cursor: 'pointer',
};

const LobbyView = ({
  roomId,
  players,
  hostId,
  userId,
  banner,
  onToggleReady,
  onStart,
  onAddBot,
  onRemoveBot,
  onReturnToWelcome,
}) => {
  const isHost = hostId === userId;
  const readyCount = players.filter((player) => player.isReady).length;
  const canStart = isHost && players.length >= 2 && readyCount === players.length;

  return (
    <div style={cardStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>Lobby · Room {roomId}</h2>
          <p style={{ marginTop: '6px', color: '#94a3b8', fontSize: '15px' }}>{banner}</p>
        </div>
        <button type="button" onClick={onReturnToWelcome} style={subtleButton}>
          Leave session
        </button>
      </header>

      <section>
        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#e2e8f0' }}>
          Players ({players.length})
        </h3>
        <div style={listStyle}>
          {players.map((player) => {
            const labelParts = [player.name];
            if (player.isHost) labelParts.push('· host');
            if (player.isBot) labelParts.push('· bot');
            return (
              <div
                key={player.id}
                style={playerRowStyle(player.id === userId, player.isReady, player.isHost)}
              >
                <span>{labelParts.join(' ')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: player.isReady ? '#4ade80' : '#facc15', fontWeight: 600 }}>
                    {player.isReady ? 'Ready' : 'Not ready'}
                  </span>
                  {(player.id === userId || (isHost && player.isBot)) && (
                    <button
                      type="button"
                      onClick={() => onToggleReady(player.id)}
                      style={{ ...subtleButton, color: '#f8fafc' }}
                    >
                      Toggle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {isHost && (
        <section style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" onClick={onAddBot} style={buttonStyle}>
            Add test player
          </button>
          <button type="button" onClick={onRemoveBot} style={{ ...buttonStyle, background: 'rgba(185,28,28,0.25)' }}>
            Remove test player
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, rgba(190, 242, 100, 0.95), rgba(59, 130, 246, 0.95))',
              color: '#0f172a',
              opacity: canStart ? 1 : 0.4,
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
          >
            Start game
          </button>
        </section>
      )}

      {!isHost && (
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          Waiting for the host to start once everyone is ready.
        </p>
      )}
    </div>
  );
};

export default LobbyView;
