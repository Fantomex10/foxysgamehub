const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15,23,42,0.72)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const cardStyle = {
  background: 'rgba(15,23,42,0.92)',
  borderRadius: '20px',
  padding: '28px 32px',
  border: '1px solid rgba(148,163,184,0.35)',
  boxShadow: '0 32px 64px rgba(15,23,42,0.65)',
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

const suitButtonStyle = (accent) => ({
  padding: '14px 16px',
  borderRadius: '14px',
  border: `1px solid ${accent}`,
  color: accent,
  fontWeight: 700,
  fontSize: '16px',
  cursor: 'pointer',
  background: 'rgba(15,23,42,0.6)',
});

const cancelButtonStyle = {
  marginTop: '8px',
  alignSelf: 'center',
  padding: '10px 18px',
  borderRadius: '999px',
  border: '1px solid rgba(148,163,184,0.35)',
  background: 'transparent',
  color: '#94a3b8',
  fontSize: '14px',
  cursor: 'pointer',
};

const SUIT_ACCENTS = {
  hearts: '#f87171',
  diamonds: '#facc15',
  clubs: '#38bdf8',
  spades: '#f8fafc',
};

const prettySuit = (suit) => suit.charAt(0).toUpperCase() + suit.slice(1);

const SuitPicker = ({ suits, onSelect, onCancel }) => (
  <div style={overlayStyle}>
    <div style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: '22px', color: '#f8fafc', textAlign: 'center' }}>
        Choose a suit for the wild card
      </h2>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
        Bots will follow the declared suit until another wild appears.
      </p>

      <div style={buttonsRowStyle}>
        {suits.map((suit) => (
          <button
            key={suit}
            type="button"
            onClick={() => onSelect(suit)}
            style={suitButtonStyle(SUIT_ACCENTS[suit] ?? '#f8fafc')}
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

export default SuitPicker;
