const containerStyle = {
  maxWidth: '640px',
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

const buttonStyle = {
  padding: '14px 20px',
  borderRadius: '16px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,118,110,0.45)',
  color: '#f8fafc',
  fontSize: '18px',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButton = {
  ...buttonStyle,
  background: 'rgba(59,130,246,0.35)',
};

const HubMenu = ({ onCreate, onJoin }) => (
  <div style={containerStyle}>
    <header>
      <h2 style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>Lobby Selection</h2>
      <p style={{ marginTop: '8px', color: '#94a3b8', fontSize: '16px' }}>
        Create a new lobby to customise game rules, or join an existing one.
      </p>
    </header>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button type="button" onClick={onCreate} style={buttonStyle}>
        Create lobby
      </button>
      <button type="button" onClick={onJoin} style={secondaryButton}>
        Join lobby
      </button>
    </div>
  </div>
);

export default HubMenu;
