import { useState } from 'react';

const cardStyle = {
  backgroundColor: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: '24px',
  padding: '48px 40px',
  maxWidth: '560px',
  margin: '0 auto',
  boxShadow: '0 32px 64px rgba(15,23,42,0.65)',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  textAlign: 'center',
};

const inputStyle = {
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,23,42,0.55)',
  color: '#f8fafc',
  fontSize: '16px',
};

const buttonStyle = {
  padding: '12px 18px',
  borderRadius: '999px',
  border: 'none',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  color: '#0f172a',
  background: 'linear-gradient(135deg, rgba(190, 242, 100, 0.95), rgba(59, 130, 246, 0.95))',
};

const LoginHub = ({ defaultName = '', onSubmit }) => {
  const [name, setName] = useState(defaultName);
  const ready = Boolean(name.trim());

  return (
    <div style={cardStyle}>
      <div>
        <h1 style={{ margin: 0, fontSize: '32px', color: '#f8fafc' }}>Foxy Game Hub</h1>
        <p style={{ marginTop: '12px', color: '#94a3b8', fontSize: '16px' }}>
          Enter a display name to continue. Accounts and authentication will be enabled later.
        </p>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#e2e8f0', fontSize: '15px' }}>
        Display name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="FoxyFan"
          style={inputStyle}
        />
      </label>

      <button
        type="button"
        onClick={() => ready && onSubmit?.(name.trim())}
        disabled={!ready}
        style={{
          ...buttonStyle,
          opacity: ready ? 1 : 0.4,
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default LoginHub;
