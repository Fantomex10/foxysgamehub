import { useEffect, useMemo, useRef, useState } from 'react';

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

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  color: '#e2e8f0',
  fontSize: '15px',
};

const inputStyle = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'rgba(15,23,42,0.55)',
  color: '#f8fafc',
  fontSize: '15px',
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const primaryButton = {
  padding: '12px 18px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, rgba(190, 242, 100, 0.95), rgba(59, 130, 246, 0.95))',
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

const CreateLobbyForm = ({ engines, defaultEngineId, onCancel, onCreate }) => {
  const [roomName, setRoomName] = useState('Friendly Match');
  const [engineId, setEngineId] = useState(defaultEngineId);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [botCount, setBotCount] = useState(1);

  const selectedEngine = engines.find((engine) => engine.id === engineId) ?? engines[0];
  const playerConfig = selectedEngine?.metadata?.playerConfig ?? {};
  const requiredPlayers = playerConfig.requiredPlayers ?? null;
  const minPlayers = playerConfig.minPlayers ?? requiredPlayers ?? 2;
  const maxPlayersCap = playerConfig.maxPlayers ?? Math.max(4, minPlayers);
  const minBots = playerConfig.minBots ?? 0;
  const lastEngineIdRef = useRef(engineId);

  useEffect(() => {
    const desiredPlayers = requiredPlayers ?? maxPlayers;
    const clampedPlayers = requiredPlayers ?? Math.min(Math.max(minPlayers, desiredPlayers), maxPlayersCap);
    if (clampedPlayers !== maxPlayers) {
      setMaxPlayers(clampedPlayers);
    }

    const targetPlayers = clampedPlayers;
    const maxAllowedBots = Math.max(0, Math.min(playerConfig.maxBots ?? targetPlayers - 1, targetPlayers - 1));

    let desiredBots = botCount;
    if (lastEngineIdRef.current !== engineId && playerConfig.defaultBots !== undefined) {
      desiredBots = playerConfig.defaultBots;
    }

    const clampedBots = Math.min(Math.max(minBots, desiredBots), maxAllowedBots);
    if (clampedBots !== botCount) {
      setBotCount(clampedBots);
    }

    lastEngineIdRef.current = engineId;
  }, [engineId, playerConfig.maxBots, playerConfig.defaultBots, requiredPlayers, minPlayers, maxPlayersCap, minBots, maxPlayers, botCount]);

  const maxBotsForPlayers = useMemo(() => {
    const targetPlayers = requiredPlayers ?? maxPlayers;
    const maxBotsCap = playerConfig.maxBots ?? targetPlayers - 1;
    return Math.max(0, Math.min(maxBotsCap, targetPlayers - 1));
  }, [playerConfig.maxBots, maxPlayers, requiredPlayers]);

  const canSubmit = Boolean(selectedEngine) && maxPlayers >= minPlayers;

  return (
    <div style={containerStyle}>
      <header>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#f8fafc' }}>Create Lobby</h2>
        <p style={{ marginTop: '8px', color: '#94a3b8', fontSize: '15px' }}>
          Configure your room and invite players. Options can be expanded once networking is enabled.
        </p>
      </header>

      <label style={fieldStyle}>
        Lobby name
        <input
          value={roomName}
          onChange={(event) => setRoomName(event.target.value)}
          placeholder="Foxy Friday Night"
          style={inputStyle}
        />
      </label>

      <label style={fieldStyle}>
        Game
        <select
          value={engineId}
          onChange={(event) => setEngineId(event.target.value)}
          style={inputStyle}
        >
          {engines.map((engine) => (
            <option key={engine.id} value={engine.id}>
              {engine.name}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <label style={fieldStyle}>
          Max players
          <input
            type="number"
            min={minPlayers}
            max={maxPlayersCap}
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(Number(event.target.value) || minPlayers)}
            style={inputStyle}
            disabled={Boolean(requiredPlayers)}
          />
        </label>

        <label style={fieldStyle}>
          Starting bots
          <input
            type="number"
            min={minBots}
            max={maxBotsForPlayers}
            value={botCount}
            onChange={(event) => setBotCount(Number(event.target.value) || minBots)}
            style={inputStyle}
          />
        </label>
      </div>

      {requiredPlayers && (
        <div style={{ color: '#94a3b8', fontSize: '13px' }}>Hearts requires four players. Add bots to fill empty seats if needed.</div>
      )}

      <div style={footerStyle}>
        <button type="button" onClick={onCancel} style={tertiaryButton}>
          Back
        </button>
        <button
          type="button"
          onClick={() =>
            canSubmit &&
            onCreate?.({
              roomName: roomName.trim() || 'Friendly Match',
              engineId,
              settings: {
                maxPlayers: requiredPlayers ?? Number(maxPlayers),
                initialBots: Math.min(Number(botCount), maxBotsForPlayers),
                rules: {},
              },
            })
          }
          disabled={!canSubmit}
          style={{
            ...primaryButton,
            opacity: canSubmit ? 1 : 0.4,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          Create lobby
        </button>
      </div>
    </div>
  );
};

export default CreateLobbyForm;
