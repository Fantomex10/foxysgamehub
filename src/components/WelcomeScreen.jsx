import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const WelcomeScreen = ({ name, onNameChange, onCreateRoom }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const ready = Boolean(name.trim());

  const cardStyle = {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.xl,
    padding: '48px 40px',
    maxWidth: '560px',
    margin: '0 auto',
    boxShadow: theme.shadows.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
    textAlign: 'center',
  };

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceAlt,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('16px', fontScale),
  };

  const buttonStyle = {
    padding: '12px 18px',
    borderRadius: '999px',
    border: 'none',
    fontSize: scaleFont('16px', fontScale),
    fontWeight: 600,
    cursor: 'pointer',
    color: theme.buttons.primaryText,
    background: theme.buttons.primaryBg,
  };

  return (
    <div style={cardStyle}>
      <div>
        <h1 style={{ margin: 0, fontSize: scaleFont('32px', fontScale), color: theme.colors.textPrimary }}>
          Foxy Game Hub - Photon Alpha
        </h1>
        <p style={{ marginTop: '12px', color: theme.colors.textMuted, fontSize: scaleFont('16px', fontScale) }}>
          Start by picking a display name. We will scaffold a local lobby that mirrors the Photon workflow.
        </p>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: theme.colors.textSecondary, fontSize: scaleFont('15px', fontScale) }}>
        Display name
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="FoxyFan"
          style={inputStyle}
        />
      </label>

      <button
        type="button"
        onClick={onCreateRoom}
        disabled={!ready}
        style={{
          ...buttonStyle,
          opacity: ready ? 1 : 0.4,
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        Create Test Lobby
      </button>

      <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: scaleFont('14px', fontScale) }}>
        Joining by code and Photon networking will land in the next iteration.
      </p>
    </div>
  );
};

export default WelcomeScreen;

