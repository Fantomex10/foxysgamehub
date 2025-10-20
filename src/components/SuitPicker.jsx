import { useCustomizationTokens } from '../customization/useCustomization.js';

const suitAccent = (theme, suit) => {
  switch (suit) {
    case 'hearts':
      return theme.colors.accentDanger;
    case 'diamonds':
      return theme.colors.accentWarning;
    case 'clubs':
      return theme.colors.accentInfo;
    case 'spades':
    default:
      return theme.colors.accentPrimary;
  }
};

const prettySuit = (suit) => suit.charAt(0).toUpperCase() + suit.slice(1);

const SuitPicker = ({ suits, onSelect, onCancel }) => {
  const { theme } = useCustomizationTokens();

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: theme.overlays.scrim,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const cardStyle = {
    background: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: '28px 32px',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.panel,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const suitButtonStyle = (accent) => ({
    padding: '14px 16px',
    borderRadius: theme.radii.md,
    border: `1px solid ${accent}`,
    color: accent,
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    background: theme.colors.surfaceAlt,
  });

  const cancelButtonStyle = {
    marginTop: '8px',
    alignSelf: 'center',
    padding: '10px 18px',
    borderRadius: '999px',
    border: `1px solid ${theme.buttons.subtleBorder}`,
    background: theme.buttons.subtleBg,
    color: theme.buttons.subtleText,
    fontSize: '14px',
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: '22px', color: theme.colors.textPrimary, textAlign: 'center' }}>
          Choose a suit for the wild card
        </h2>
        <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: '14px', textAlign: 'center' }}>
          Bots will follow the declared suit until another wild appears.
        </p>

        <div style={{ display: 'grid', gap: theme.spacing.sm, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {suits.map((suit) => (
            <button
              key={suit}
              type="button"
              onClick={() => onSelect(suit)}
              style={suitButtonStyle(suitAccent(theme, suit))}
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
