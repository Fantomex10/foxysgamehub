import { SUIT_COLORS, SUIT_ICONS } from '../lib/cards.js';

const cardStyle = {
  width: '88px',
  height: '128px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.85))',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '12px',
};

const smallGlyphStyle = {
  fontWeight: 600,
  fontSize: '18px',
};

const suitStyle = {
  fontSize: '48px',
  fontWeight: 700,
  lineHeight: 1,
};

const Card = ({ card, onClick, disabled = false }) => {
  if (!card) {
    return (
      <div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>Empty</span>
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
        ...cardStyle,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: accent,
        transition: 'transform 120ms ease',
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
      <span style={smallGlyphStyle}>{card.rank}</span>
      <span style={suitStyle}>{glyph}</span>
      <span style={{ ...smallGlyphStyle, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{card.rank}</span>
    </button>
  );
};

export default Card;
