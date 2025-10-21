import { useMemo, useState } from 'react';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const HubMenu = ({
  onCreate,
  onJoin,
  onPlayWithFriends,
  onMatchmaking,
  onDailyDraw,
  onCustomize,
}) => {
  const [modalMessage, setModalMessage] = useState(null);
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;

  const handle = (callback, fallbackMessage) => {
    if (typeof callback === 'function') {
      callback();
      return;
    }
    setModalMessage(fallbackMessage);
  };

  const containerStyle = useMemo(() => ({
    maxWidth: '560px',
    margin: '0 auto',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.lg,
    padding: '20px 18px',
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
    alignItems: 'center',
  }), [theme.spacing.sm]);

  const buttonWidth = 'min(280px, 100%)';

  const primaryButton = {
    padding: '10px 14px',
    borderRadius: theme.radii.md,
    border: 'none',
    background: theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontSize: scaleFont('18px', fontScale),
    fontWeight: 700,
    cursor: 'pointer',
    transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease, opacity 0.2s ease',
    width: buttonWidth,
  };

  const accentButton = {
    padding: '10px 14px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontSize: scaleFont('18px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
    width: buttonWidth,
  };

  const baseButton = {
    padding: '10px 14px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: scaleFont('17px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
    width: buttonWidth,
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

        {onCustomize && (
          <button
            type="button"
            onClick={onCustomize}
            style={baseButton}
          >
            Customization
          </button>
        )}
      </div>

      {modalMessage && (
        <div style={overlayStyle}>
          <div style={overlayContentStyle}>
            <p style={{ margin: 0, fontSize: scaleFont('18px', fontScale), fontWeight: 600 }}>Coming soon</p>
            <p style={{ margin: 0, fontSize: scaleFont('15px', fontScale), color: theme.colors.textSecondary }}>{modalMessage}</p>
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

