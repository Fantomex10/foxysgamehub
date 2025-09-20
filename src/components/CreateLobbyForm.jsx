import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../ui/ThemeContext.jsx';

const CreateLobbyForm = ({ engines, defaultEngineId, onCancel, onCreate }) => {
  const { theme } = useTheme();
  const [roomName, setRoomName] = useState('Friendly Match');
  const [engineId, setEngineId] = useState(defaultEngineId);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [botCount, setBotCount] = useState(1);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const defaultEngineRef = useRef(defaultEngineId);
  const lastEngineIdRef = useRef(engineId);

  const selectedEngine = engines.find((engine) => engine.id === engineId) ?? engines[0];
  const playerConfig = selectedEngine?.metadata?.playerConfig ?? {};
  const requiredPlayers = playerConfig.requiredPlayers ?? null;
  const minPlayers = playerConfig.minPlayers ?? requiredPlayers ?? 2;
  const maxPlayersCap = playerConfig.maxPlayers ?? Math.max(4, minPlayers);
  const minBots = playerConfig.minBots ?? 0;

  useEffect(() => {
    if (defaultEngineRef.current !== defaultEngineId) {
      defaultEngineRef.current = defaultEngineId;
      if (engines.some((engine) => engine.id === defaultEngineId)) {
        setEngineId(defaultEngineId);
      }
    }
  }, [defaultEngineId, engines]);

  useEffect(() => {
    const desiredPlayers = requiredPlayers ?? maxPlayers;
    const clampedPlayers = requiredPlayers ?? Math.min(Math.max(minPlayers, desiredPlayers), maxPlayersCap);
    if (clampedPlayers !== maxPlayers) {
      setMaxPlayers(clampedPlayers);
    }

    const targetPlayers = clampedPlayers;
    const maxAllowedBots = Math.max(0, Math.min(playerConfig.maxBots ?? targetPlayers - 1, targetPlayers - 1));

    let desiredBots = botCount;
    if (lastEngineIdRef.current !== engineId) {
      if (playerConfig.defaultBots !== undefined) {
        desiredBots = playerConfig.defaultBots;
      } else if (requiredPlayers) {
        desiredBots = requiredPlayers - 1;
      } else {
        desiredBots = Math.min(botCount, maxAllowedBots);
      }
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

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isPrivate && password.trim().length === 0) {
      setPassword('');
      setPasswordError('Set a password to create a private lobby.');
      setShowPasswordModal(true);
      return;
    }

    onCreate?.({
      roomName: roomName.trim() || 'Friendly Match',
      engineId,
      settings: {
        maxPlayers: requiredPlayers ?? Number(maxPlayers),
        initialBots: Math.min(Number(botCount), maxBotsForPlayers),
        rules: {},
        visibility: isPrivate ? 'private' : 'public',
        password: isPrivate ? password.trim() : null,
      },
    });
    if (isPrivate) {
      setPassword('');
    }
  };

  const containerStyle = useMemo(() => ({
    maxWidth: '680px',
    margin: '0 auto',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: '16px',
    boxShadow: theme.shadows.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    boxSizing: 'border-box',
    width: '100%',
    position: 'relative',
  }), [theme]);

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    color: theme.colors.textSecondary,
    fontSize: '15px',
  };

  const labelStyle = {
    minWidth: '100px',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: '11px',
  };

  const inputStyle = {
    flex: 1,
    padding: '8px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: '15px',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `linear-gradient(45deg, transparent 50%, ${theme.colors.textMuted} 50%), linear-gradient(135deg, ${theme.colors.textMuted} 50%, transparent 50%)`,
    backgroundPosition: 'calc(100% - 18px) calc(50% - 5px), calc(100% - 13px) calc(50% - 5px)',
    backgroundSize: '6px 6px',
    backgroundRepeat: 'no-repeat',
  };

  const stepperButtonStyle = {
    width: '32px',
    height: '32px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const stepperValueStyle = {
    minWidth: '32px',
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: '15px',
    fontWeight: 600,
  };

  const primaryButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    cursor: 'pointer',
  };

  const tertiaryButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const toggleButtonStyle = (active) => ({
    padding: '8px 12px',
    borderRadius: '999px',
    border: `1px solid ${active ? theme.buttons.primaryBorder ?? theme.colors.accentPrimary : theme.buttons.subtleBorder}`,
    background: active ? theme.buttons.primaryBg : theme.buttons.ghostBg,
    color: active ? theme.buttons.primaryText : theme.buttons.ghostText ?? theme.colors.textSecondary,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '72px',
  });

  const optionsButtonStyle = {
    padding: '9px 14px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
    alignSelf: 'flex-start',
  };

  const modalBackdropStyle = {
    position: 'absolute',
    inset: 0,
    background: theme.overlays.scrim,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    borderRadius: theme.radii.lg,
    zIndex: 2,
  };

  const modalStyle = {
    width: '100%',
    maxWidth: '360px',
    background: theme.colors.surfaceElevated ?? theme.colors.surface,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    color: theme.colors.textPrimary,
  };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>Lobby name</span>
        <input
          value={roomName}
          onChange={(event) => setRoomName(event.target.value)}
          placeholder="Foxy Friday Night"
          style={inputStyle}
        />
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Game</span>
        <select
          value={engineId}
          onChange={(event) => setEngineId(event.target.value)}
          style={selectStyle}
        >
          {engines.map((engine) => (
            <option key={engine.id} value={engine.id}>
              {engine.name}
            </option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Visibility</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            style={toggleButtonStyle(!isPrivate)}
            onClick={() => setIsPrivate(false)}
          >
            Public
          </button>
          <button
            type="button"
            style={toggleButtonStyle(isPrivate)}
            onClick={() => setIsPrivate(true)}
          >
            Private
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Max players</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMaxPlayers((value) => Math.max(minPlayers, Number(value) - 1))}
            style={{
              ...stepperButtonStyle,
              opacity: maxPlayers <= minPlayers ? 0.4 : 1,
              cursor: maxPlayers <= minPlayers ? 'not-allowed' : 'pointer',
            }}
            disabled={Boolean(requiredPlayers) || maxPlayers <= minPlayers}
            aria-label="Decrease max players"
          >
            −
          </button>
          <span style={stepperValueStyle}>{requiredPlayers ?? maxPlayers}</span>
          <button
            type="button"
            onClick={() => setMaxPlayers((value) => Math.min(maxPlayersCap, Number(value) + 1))}
            style={{
              ...stepperButtonStyle,
              opacity: requiredPlayers ? 0.35 : maxPlayers >= maxPlayersCap ? 0.4 : 1,
              cursor: requiredPlayers || maxPlayers >= maxPlayersCap ? 'not-allowed' : 'pointer',
            }}
            disabled={Boolean(requiredPlayers) || maxPlayers >= maxPlayersCap}
            aria-label="Increase max players"
          >
            +
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Bots</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setBotCount((value) => Math.max(minBots, Number(value) - 1))}
            style={{
              ...stepperButtonStyle,
              opacity: botCount <= minBots ? 0.4 : 1,
              cursor: botCount <= minBots ? 'not-allowed' : 'pointer',
            }}
            disabled={botCount <= minBots}
            aria-label="Decrease bots"
          >
            −
          </button>
          <span style={stepperValueStyle}>{botCount}</span>
          <button
            type="button"
            onClick={() => setBotCount((value) => Math.min(maxBotsForPlayers, Number(value) + 1))}
            style={{
              ...stepperButtonStyle,
              opacity: botCount >= maxBotsForPlayers ? 0.4 : 1,
              cursor: botCount >= maxBotsForPlayers ? 'not-allowed' : 'pointer',
            }}
            disabled={botCount >= maxBotsForPlayers}
            aria-label="Increase bots"
          >
            +
          </button>
        </div>
      </div>

      {requiredPlayers && (
        <div style={{ color: theme.colors.textMuted, fontSize: '12px', textAlign: 'right' }}>
          Hearts needs four players. Add bots to fill empty seats if required.
        </div>
      )}

      <button
        type="button"
        style={optionsButtonStyle}
        onClick={() => setShowOptionsModal(true)}
      >
        Game options
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px',
          gap: '8px',
        }}
      >
        <button type="button" onClick={onCancel} style={tertiaryButton}>
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
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

      {showOptionsModal && (
        <div style={modalBackdropStyle}>
          <div style={modalStyle}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Custom game rules</p>
            <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px' }}>
              Rule editing isn&apos;t ready yet. Join the Discord to share suggestions!
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowOptionsModal(false)}
                style={{ ...tertiaryButton, padding: '8px 14px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={modalBackdropStyle}>
          <div style={modalStyle}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Set lobby password</p>
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError('');
              }}
              placeholder="eg. foxes-rule"
              style={{ ...inputStyle, width: '100%' }}
              type="password"
            />
            {passwordError && (
              <p style={{ margin: 0, fontSize: '12px', color: theme.colors.accentDanger, textAlign: 'left' }}>
                {passwordError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                }}
                style={{ ...tertiaryButton, padding: '8px 14px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!password.trim()) {
                    setPasswordError('Password cannot be empty.');
                    return;
                  }
                  setShowPasswordModal(false);
                  handleSubmit();
                }}
                style={{ ...primaryButton, padding: '8px 14px' }}
              >
                Save &amp; continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLobbyForm;
