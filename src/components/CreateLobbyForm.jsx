import { useEffect, useMemo, useRef, useState } from 'react';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import { NumericStepper } from './createLobby/NumericStepper.jsx';
import { VisibilityToggle } from './createLobby/VisibilityToggle.jsx';
import { OverlayModal } from './createLobby/OverlayModal.jsx';

const CreateLobbyForm = ({ engines, defaultEngineId, onCancel, onCreate }) => {
  const {
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  } = useCustomizationTokens();
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

  const labelStyle = {
    minWidth: '100px',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: scaleFont('11px'),
  };

  const inputStyle = {
    flex: 1,
    padding: '8px 12px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('15px'),
  };

  const chevronColor = theme.colors.textMuted;

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `linear-gradient(45deg, transparent 50%, ${chevronColor} 50%), linear-gradient(135deg, ${chevronColor} 50%, transparent 50%)`,
    backgroundPosition: 'calc(100% - 18px) calc(50% - 5px), calc(100% - 13px) calc(50% - 5px)',
    backgroundSize: '6px 6px',
    backgroundRepeat: 'no-repeat',
  };

  const transitionValue = accessibility?.reducedMotion ? 'none' : `background ${motionDuration('200ms')} ease, transform ${motionDuration('200ms')} ease`;

  const primaryButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: pieces.primary ?? theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    cursor: 'pointer',
    transition: transitionValue,
  };

  const tertiaryButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontWeight: 500,
    cursor: 'pointer',
    transition: transitionValue,
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
          <label style={{ ...labelStyle, fontSize: scaleFont('12px') }}>Room name</label>
          <input
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="Friendly Match"
            style={{ ...inputStyle, width: '260px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" style={tertiaryButton} onClick={() => setShowOptionsModal(true)}>
            Advanced options
          </button>
          <button type="button" style={primaryButton} onClick={handleSubmit} disabled={!canSubmit}>
            Create lobby
          </button>
          <button type="button" style={tertiaryButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: theme.spacing.sm, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Game</label>
          <select value={engineId} onChange={(event) => setEngineId(event.target.value)} style={selectStyle}>
            {engines.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.name}
              </option>
            ))}
          </select>
        </div>

        <NumericStepper
          label="Max players"
          value={maxPlayers}
          displayValue={requiredPlayers ?? maxPlayers}
          min={requiredPlayers ?? minPlayers}
          max={requiredPlayers ?? maxPlayersCap}
          onChange={(next) => setMaxPlayers(next)}
          decreaseLabel="Decrease player count"
          increaseLabel="Increase player count"
        />

        <NumericStepper
          label="Bots"
          value={botCount}
          min={minBots}
          max={maxBotsForPlayers}
          onChange={(next) => setBotCount(next)}
          decreaseLabel="Decrease bot count"
          increaseLabel="Increase bot count"
        />

        <VisibilityToggle value={isPrivate} onChange={setIsPrivate} />
      </div>

      {isPrivate && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ ...labelStyle, flex: '0 0 120px' }}>Password</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Secret code"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="button" style={primaryButton} onClick={() => setShowPasswordModal(true)}>
            Set password
          </button>
        </div>
      )}

      {showOptionsModal && (
        <OverlayModal
          onClose={() => setShowOptionsModal(false)}
          ariaLabel="Advanced options"
          maxWidth="min(640px, 100%)"
          zIndex={100}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: scaleFont('20px') }}>Advanced options</h2>
            <button type="button" onClick={() => setShowOptionsModal(false)} style={tertiaryButton}>
              Close
            </button>
          </header>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: scaleFont('14px') }}>
            Configure seats, bots, and lobby privacy before creating the room. Use the visibility toggle to
            require a password for private matches.
          </p>
          <footer style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" style={tertiaryButton} onClick={() => setShowOptionsModal(false)}>
              Done
            </button>
          </footer>
        </OverlayModal>
      )}

      {showPasswordModal && (
        <OverlayModal
          onClose={() => setShowPasswordModal(false)}
          ariaLabel="Private lobby password"
          maxWidth="min(420px, 100%)"
          zIndex={110}
        >
          <h2 style={{ margin: 0, fontSize: scaleFont('18px') }}>Private lobby password</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: scaleFont('14px') }}>
            Share the password with invited players. They will need this code to join the lobby.
          </p>
          <input
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError('');
            }}
            placeholder="Secret code"
            style={inputStyle}
          />
          {passwordError && (
            <p style={{ margin: 0, color: theme.colors.accentDanger, fontSize: scaleFont('12px') }}>{passwordError}</p>
          )}
          <footer style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" style={tertiaryButton} onClick={() => setShowPasswordModal(false)}>
              Cancel
            </button>
            <button type="button" style={primaryButton} onClick={() => setShowPasswordModal(false)}>
              Save
            </button>
          </footer>
        </OverlayModal>
      )}
    </div>
  );
};

export default CreateLobbyForm;
