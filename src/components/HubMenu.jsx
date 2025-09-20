import { useMemo, useState } from 'react';
import { useTheme } from '../ui/ThemeContext.jsx';

const HubMenu = ({
  onCreate,
  onJoin,
  onPlayWithFriends,
  onMatchmaking,
  onDailyDraw,
}) => {
  const [modalMessage, setModalMessage] = useState(null);
  const { theme } = useTheme();

  const handle = (callback, fallbackMessage) => {
    if (typeof callback === 'function') {
      callback();
      return;
    }
    setModalMessage(fallbackMessage);
  };

  const containerStyle = useMemo(() => ({
    maxWidth: '640px',
    margin: '0 auto',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: '28px 24px',
    boxShadow: theme.shadows.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    boxSizing: 'border-box',
    width: '100%',
    position: 'relative',
  }), [theme]);

  const stackStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  }), [theme.spacing.sm]);

  const primaryButton = {
    padding: '14px 18px',
    borderRadius: theme.radii.md,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontSize: '18px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  };

  const accentButton = {
    padding: '14px 18px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const baseButton = {
    padding: '13px 18px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: '17px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const warningButton = {
    ...baseButton,
    border: `1px solid ${theme.colors.accentDanger}`,
    background: theme.colors.accentDangerSoft,
    color: theme.colors.accentDanger,
  };

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    background: theme.overlays.scrim,
    borderRadius: theme.radii.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  };

  const overlayContentStyle = {
    maxWidth: '360px',
    textAlign: 'center',
    color: theme.colors.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  };

  return (
    <div style={containerStyle}>
      <div style={stackStyle}>
        <button
          type="button"
          onClick={() => handle(onPlayWithFriends, 'Friend lobbies will appear here soon.')}
          style={primaryButton}
        >
          Play with friends
        </button>

        <button
          type="button"
          onClick={() => handle(onCreate, 'Creating lobbies is disabled right now.')}
          style={accentButton}
        >
          Create lobby
        </button>

        <button
          type="button"
          onClick={() => handle(onJoin, 'Lobby browser is unavailable.')}
          style={accentButton}
        >
          Join lobby
        </button>

        <button
          type="button"
          onClick={() => handle(onMatchmaking, 'Matchmaking queues are on the roadmap.')}
          style={baseButton}
        >
          Match making
        </button>

        <button
          type="button"
          onClick={() => handle(onDailyDraw, 'Daily draw rewards will unlock soon.')}
          style={warningButton}
        >
          Enter Daily Draw
        </button>
      </div>

      {modalMessage && (
        <div style={overlayStyle}>
          <div style={overlayContentStyle}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Coming soon</p>
            <p style={{ margin: 0, fontSize: '15px', color: theme.colors.textSecondary }}>{modalMessage}</p>
            <button
              type="button"
              onClick={() => setModalMessage(null)}
              style={baseButton}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubMenu;
