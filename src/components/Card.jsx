import { SUIT_COLORS, SUIT_ICONS } from '../lib/cards.js';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const Card = ({ card, onClick, disabled = false }) => {
  const { theme, cards, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;

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
    fontSize: scaleFont('18px', fontScale),
    color: cards.text ?? theme.colors.textPrimary,
  };

  const suitStyle = {
    fontSize: scaleFont('48px', fontScale),
    fontWeight: 700,
    lineHeight: 1,
    color: cards.accent ?? theme.colors.accentPrimary,
  };

  if (!card) {
    return (
      <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
        <span style={{ fontSize: scaleFont('14px', fontScale), color: theme.colors.textMuted }}>Empty</span>
      </div>
    );
  }

  const accent = SUIT_COLORS[card.suit];
  const glyph = SUIT_ICONS[card.suit];

  const handlePress = (event) => {
    if (disabled || prefersReducedMotion) return;
    event.currentTarget.style.transform = 'translateY(2px) scale(0.98)';
  };

  const handleReset = (event) => {
    event.currentTarget.style.transform = 'none';
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick?.(card)}
      disabled={disabled}
      style={{
        ...baseStyle,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: prefersReducedMotion ? 'none' : 'transform 120ms ease',
        background: cards.face ?? fallbackFace,
      }}
      onMouseDown={handlePress}
      onMouseUp={handleReset}
      onMouseLeave={handleReset}
    >
      <span style={{ ...smallGlyphStyle, color: accent }}>{card.rank}</span>
      <span style={{ ...suitStyle, color: accent }}>{glyph}</span>
      <span style={{ ...smallGlyphStyle, color: accent, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{card.rank}</span>
    </button>
  );
};

export default Card;

