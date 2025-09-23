import { useMemo } from 'react';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';

const JoinLobbyList = ({ lobbies, onJoin, onBack }) => {
  const {
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  } = useCustomizationTokens();

  const transitionValue = accessibility?.reducedMotion ? 'none' : `transform ${motionDuration('0.2s')} ease, opacity ${motionDuration('0.2s')} ease`;

  const containerStyle = useMemo(() => ({
    maxWidth: '720px',
    margin: '0 auto',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.xl,
    padding: '32px 28px',
    boxShadow: theme.shadows.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
    boxSizing: 'border-box',
    width: '100%',
  }), [theme]);

  const listStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  }), [theme.spacing.sm]);

  const lobbyRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.borderSubtle}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
  };

  const joinButtonStyle = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: pieces.primary ?? theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    cursor: 'pointer',
    transition: transitionValue,
    fontSize: scaleFont('14px'),
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
    fontSize: scaleFont('14px'),
  };

  return (
    <div style={containerStyle}>
      <header>
        <h2 style={{ margin: 0, fontSize: scaleFont('28px'), color: theme.colors.textPrimary }}>Join Lobby</h2>
        <p style={{ marginTop: '8px', color: theme.colors.textMuted, fontSize: scaleFont('15px') }}>
          Active lobbies discovered locally. Networking integration will broaden this list later.
        </p>
      </header>

      <div style={listStyle}>
        {lobbies.length === 0 && (
          <div style={{ color: theme.colors.textMuted, fontSize: scaleFont('14px'), textAlign: 'center', padding: '24px 0' }}>
            No lobbies available yet. Create one or try again later.
          </div>
        )}
        {lobbies.map((lobby) => {
          const isFull = lobby.maxPlayers > 0 && lobby.playerCount >= lobby.maxPlayers;
          return (
            <div key={lobby.id} style={lobbyRowStyle}>
              <div>
                <div style={{ fontWeight: 600, fontSize: scaleFont('15px') }}>{lobby.roomName}</div>
                <div style={{ color: theme.colors.textMuted, fontSize: scaleFont('13px') }}>
                  {lobby.engineName} · Host {lobby.hostName} · Players {lobby.playerCount}/{lobby.maxPlayers || '∞'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isFull && onJoin?.(lobby)}
                disabled={isFull}
                style={{
                  ...joinButtonStyle,
                  opacity: isFull ? 0.45 : 1,
                  cursor: isFull ? 'not-allowed' : 'pointer',
                }}
              >
                Join
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onBack} style={tertiaryButton}>
          Back
        </button>
      </div>
    </div>
  );
};

export default JoinLobbyList;
