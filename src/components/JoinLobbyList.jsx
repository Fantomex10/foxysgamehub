const containerStyle = {
  maxWidth: '720px',
  margin: '0 auto',
  backgroundColor: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: '24px',
  padding: '40px 32px',
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

const lobbyRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,23,42,0.6)',
  color: '#f8fafc',
};

const joinButtonStyle = {
  padding: '10px 16px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85), rgba(14, 165, 233, 0.85))',
  color: '#0f172a',
  fontWeight: 600,
  cursor: 'pointer',
};

const tertiaryButton = {
  padding: '10px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'transparent',
  color: '#94a3b8',
  fontWeight: 500,
  cursor: 'pointer',
};

const JoinLobbyList = ({ lobbies, onJoin, onBack }) => (
  <div style={containerStyle}>
    <header>
      <h2 style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>Join Lobby</h2>
      <p style={{ marginTop: '8px', color: '#94a3b8', fontSize: '15px' }}>
        Active lobbies discovered locally. Networking integration will broaden this list later.
      </p>
    </header>

    <div style={listStyle}>
      {lobbies.length === 0 && (
        <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
          No lobbies available yet. Create one or try again later.
        </div>
      )}
      {lobbies.map((lobby) => (
        <div key={lobby.id} style={lobbyRowStyle}>
          <div>
            <div style={{ fontWeight: 600 }}>{lobby.roomName}</div>
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>
              {lobby.engineName} · Host {lobby.hostName} · Players {lobby.playerCount}/{lobby.maxPlayers || '∞'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJoin?.(lobby)}
            disabled={lobby.maxPlayers > 0 && lobby.playerCount >= lobby.maxPlayers}
            style={{
              ...joinButtonStyle,
              opacity: lobby.maxPlayers > 0 && lobby.playerCount >= lobby.maxPlayers ? 0.5 : 1,
              cursor: lobby.maxPlayers > 0 && lobby.playerCount >= lobby.maxPlayers ? 'not-allowed' : 'pointer',
            }}
          >
            Join
          </button>
        </div>
      ))}
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button type="button" onClick={onBack} style={tertiaryButton}>
        Back
      </button>
    </div>
  </div>
);

export default JoinLobbyList;
