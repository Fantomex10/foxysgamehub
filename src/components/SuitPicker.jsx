import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';

const withAlpha = (color, alpha) => {
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

const SuitPicker = ({ suits, onSelect, onCancel }) => {
  const {
    theme,
    pieces,
    cards,
    scaleFont,
  } = useCustomizationTokens();

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: theme.overlays.scrim,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '24px',
  };

  const cardStyle = {
    background: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: '28px 32px',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.panel,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  };

  const buttonsRowStyle = {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  };

  const accentForSuit = (suit) => {
    if (suit === 'hearts' || suit === 'diamonds') {
      return theme.colors.accentDanger;
    }
    if (suit === 'clubs') {
      return pieces.primary ?? theme.colors.accentPrimary;
    }
    if (suit === 'spades') {
      return cards.text ?? theme.colors.textPrimary;
    }
    return pieces.highlight ?? theme.colors.accentPrimary;
  };

  const suitButtonStyle = (suit) => {
    const accent = accentForSuit(suit);
    return {
      padding: '14px 16px',
      borderRadius: theme.radii.md,
      border: `1px solid ${accent}`,
      color: accent,
      fontWeight: 700,
      fontSize: scaleFont('16px'),
      cursor: 'pointer',
      background: withAlpha(accent, 0.12),
    };
  };

  const cancelButtonStyle = {
    marginTop: '8px',
    alignSelf: 'center',
    padding: '10px 18px',
    borderRadius: '999px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: scaleFont('14px'),
    cursor: 'pointer',
  };

  const prettySuit = (suit) => suit.charAt(0).toUpperCase() + suit.slice(1);

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: scaleFont('22px'), color: theme.colors.textPrimary, textAlign: 'center' }}>
          Choose a suit for the wild card
        </h2>
        <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: scaleFont('14px'), textAlign: 'center' }}>
          Bots will follow the declared suit until another wild appears.
        </p>

        <div style={buttonsRowStyle}>
          {suits.map((suit) => (
            <button
              key={suit}
              type="button"
              onClick={() => onSelect(suit)}
              style={suitButtonStyle(suit)}
            >
              {prettySuit(suit)}
            </button>
          ))}
        </div>

        <button type="button" onClick={onCancel} style={cancelButtonStyle}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SuitPicker;
