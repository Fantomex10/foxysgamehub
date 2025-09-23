import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';

const withAlpha = (color, alpha = 0.35) => {
  if (!color) return `rgba(15,23,42,${alpha})`;
  if (color.startsWith('rgba')) return color;
  if (!color.startsWith('#')) return color;
  const hex = color.slice(1);
  const normalized = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const intVal = Number.parseInt(normalized, 16);
  if (Number.isNaN(intVal)) return color;
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const WelcomeScreen = ({ name, onNameChange, onCreateRoom }) => {
  const {
    theme,
    pieces,
    scaleFont,
    motionDuration,
    accessibility,
  } = useCustomizationTokens();
  const ready = Boolean(name.trim());

  const transitionValue = accessibility?.reducedMotion ? 'none' : `transform ${motionDuration('0.2s')} ease, opacity ${motionDuration('0.2s')} ease`;

  const cardStyle = {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.xl,
    padding: '48px 40px',
    maxWidth: '560px',
    margin: '0 auto',
    boxShadow: theme.shadows.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    textAlign: 'center',
  };

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceMuted,
    color: theme.colors.textPrimary,
    fontSize: scaleFont('16px'),
  };

  const buttonStyle = {
    padding: '12px 18px',
    borderRadius: '999px',
    border: 'none',
    fontSize: scaleFont('16px'),
    fontWeight: 600,
    cursor: 'pointer',
    color: theme.buttons.primaryText,
    background: pieces.primary ?? theme.buttons.primaryBg,
    transition: transitionValue,
  };

  return (
    <div style={cardStyle}>
      <div>
        <h1 style={{ margin: 0, fontSize: scaleFont('32px'), color: theme.colors.textPrimary }}>
          Foxy Game Hub · Photon Alpha
        </h1>
        <p style={{ marginTop: '12px', color: theme.colors.textMuted, fontSize: scaleFont('16px') }}>
          Start by picking a display name. We will scaffold a local lobby that mirrors the Photon workflow.
        </p>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: theme.colors.textSecondary, fontSize: scaleFont('15px') }}>
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

      <p style={{ margin: 0, color: withAlpha(theme.colors.textMuted, 0.6), fontSize: scaleFont('14px') }}>
        Joining by code and Photon networking will land in the next iteration.
      </p>
    </div>
  );
};

export default WelcomeScreen;
