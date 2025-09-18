const baseCard = {
  width: '88px',
  height: '128px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.9), rgba(6, 182, 212, 0.7))',
  boxShadow: '0 12px 24px rgba(6, 182, 212, 0.25)',
};

const DrawPile = ({ remaining, onDraw, disabled = false }) => {
  const isDisabled = disabled || remaining === 0;

  return (
    <button
      type="button"
      onClick={onDraw}
      disabled={isDisabled}
      style={{
        position: 'relative',
        width: baseCard.width,
        height: baseCard.height,
        border: 'none',
        background: 'transparent',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div style={{ ...baseCard, position: 'absolute', top: 8, left: 8, opacity: 0.45 }} />
      <div style={{ ...baseCard, position: 'absolute', top: 4, left: 4, opacity: 0.7 }} />
      <div style={{ ...baseCard, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 700 }}>
        Draw
      </div>
      <span style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: '#94a3b8' }}>
        {remaining} left
      </span>
    </button>
  );
};

export default DrawPile;
