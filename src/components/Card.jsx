import { SUIT_COLORS, SUIT_ICONS } from '../lib/cards.js';
import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';

const Card = ({ card, onClick, disabled = false }) => {
  const { theme, cards, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const prefersReducedMotion = accessibility?.prefersReducedMotion ?? false;

  const fallbackFace = 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.85))';

  const baseStyle = {
    position: 'relative',
    width: '82px',
    height: '118px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${cards.border ?? theme.colors.cardBorder}`,
    background: cards.face ?? fallbackFace,
    boxShadow: theme.shadows?.card ?? '0 4px 14px rgba(15, 23, 42, 0.28)',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const cornerContainer = {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    lineHeight: 1,
    gap: '3px',
    fontSize: scaleFont('15px', fontScale),
    fontWeight: 600,
    color: cards.text ?? theme.colors.textPrimary,
    letterSpacing: '0.02em',
  };

  const centerGlyphStyle = {
    fontSize: scaleFont('44px', fontScale),
    fontWeight: 700,
    lineHeight: 1,
    color: cards.accent ?? theme.colors.accentPrimary,
    userSelect: 'none',
    pointerEvents: 'none',
  };

  const smallSuitStyle = {
    fontSize: scaleFont('13px', fontScale),
  };

  if (!card) {
    return (
      <div style={{ ...baseStyle, opacity: 0.4 }}>
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
      <span
        style={{
          ...cornerContainer,
          color: accent,
          top: '10px',
          left: '10px',
        }}
      >
        <span>{card.rank}</span>
        <span style={{ ...smallSuitStyle }}>{glyph}</span>
      </span>
      <span style={{ ...centerGlyphStyle, color: accent }}>
        {glyph}
      </span>
      <span
        style={{
          ...cornerContainer,
          color: accent,
          bottom: '10px',
          right: '10px',
          transform: 'rotate(180deg)',
        }}
      >
        <span>{card.rank}</span>
        <span style={{ ...smallSuitStyle }}>{glyph}</span>
      </span>
    </button>
  );
};

export default Card;

