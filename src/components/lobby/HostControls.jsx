import { useLobbyTokens } from './utils.js';

const buttonGroupStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const HostControls = ({
  isHost,
  canStart,
  onAddBot,
  onRemoveBot,
  onSeatManager,
  onStart,
  onConfigureTable,
  onReturnToWelcome,
  onBackToHub,
}) => {
  const { theme, pieces, scaleFont } = useLobbyTokens();

  const baseControlButton = {
    padding: '6px 10px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: scaleFont('12px'),
    cursor: 'pointer',
  };

  const primaryActionButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: pieces.primary ?? theme.buttons.primaryBg,
    color: theme.buttons.primaryText,
    fontWeight: 600,
    fontSize: scaleFont('14px'),
    cursor: 'pointer',
  };

  const outlineActionButton = {
    padding: '10px 16px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.ghostBg,
    color: theme.colors.textSecondary,
    fontWeight: 500,
    fontSize: scaleFont('14px'),
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {isHost && (
        <div style={buttonGroupStyle}>
          <button
            type="button"
            onClick={onAddBot}
            style={{
              ...baseControlButton,
              border: `1px solid ${theme.colors.accentSuccess}`,
              background: theme.colors.accentSuccessSoft,
              color: theme.colors.accentSuccess,
            }}
          >
            Add bot
          </button>
          <button
            type="button"
            onClick={onRemoveBot}
            style={{
              ...baseControlButton,
              border: `1px solid ${theme.colors.accentDanger}`,
              background: theme.colors.accentDangerSoft,
              color: theme.colors.accentDanger,
            }}
          >
            Remove bot
          </button>
          <button
            type="button"
            onClick={onSeatManager}
            style={{
              ...baseControlButton,
              border: `1px solid ${theme.colors.accentPrimary}`,
              background: theme.colors.accentPrimarySoft,
              color: theme.colors.accentPrimary,
            }}
          >
            Seat select
          </button>
        </div>
      )}

      {isHost && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px' }}>
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            style={{
              ...primaryActionButton,
              opacity: canStart ? 1 : 0.4,
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
          >
            Start game
          </button>
          <button type="button" onClick={onConfigureTable} style={outlineActionButton}>
            Table options
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        {isHost && (
          <button type="button" onClick={onReturnToWelcome} style={baseControlButton}>
            Reset lobby
          </button>
        )}
        <button type="button" onClick={onBackToHub} style={baseControlButton}>
          Back to hub
        </button>
      </div>
    </div>
  );
};

export default HostControls;
