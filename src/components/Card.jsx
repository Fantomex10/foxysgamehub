import { SUIT_COLORS, SUIT_ICONS } from '../lib/cards.js';
import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';

const Card = ({ card, onClick, disabled = false }) => {
  const { theme, cards } = useCustomizationTokens();

  const fallbackFace = 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.85))';

  const baseStyle = {
    width: '88px',
    height: '128px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${cards.border ?? theme.colors.cardBorder}`,
    background: cards.face ?? fallbackFace,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '12px',
  };

  const smallGlyphStyle = {
    fontWeight: 600,
    fontSize: '18px',
    color: cards.text ?? theme.colors.textPrimary,
  };

  const suitStyle = {
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1,
    color: cards.accent ?? theme.colors.accentPrimary,
  };

  if (!card) {
    return (
      <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
        <span style={{ fontSize: '14px', color: theme.colors.textMuted }}>Empty</span>
      </div>
    );
  }

  const accent = SUIT_COLORS[card.suit];
  const glyph = SUIT_ICONS[card.suit];

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick?.(card)}
      disabled={disabled}
      style={{
        ...baseStyle,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 120ms ease',
        background: cards.face ?? fallbackFace,
      }}
      onMouseDown={(event) => {
        if (disabled) return;
        event.currentTarget.style.transform = 'translateY(2px) scale(0.98)';
      }}
      onMouseUp={(event) => {
        event.currentTarget.style.transform = 'none';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'none';
      }}
    >
      <span style={{ ...smallGlyphStyle, color: accent }}>{card.rank}</span>
      <span style={{ ...suitStyle, color: accent }}>{glyph}</span>
      <span style={{ ...smallGlyphStyle, color: accent, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{card.rank}</span>
    </button>
  );
};

export default Card;
