import Card from './Card.jsx';

const containerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '12px',
};

const Hand = ({ cards, onPlayCard, disabled = false }) => {
  const clickHandler = disabled ? undefined : onPlayCard;

  return (
    <div>
      <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#e2e8f0' }}>Your Hand</h2>
      <div style={containerStyle}>
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={clickHandler} disabled={disabled} />
        ))}
        {cards.length === 0 && (
          <div style={{ color: '#94a3b8' }}>Hand empty – draw from the deck.</div>
        )}
      </div>
    </div>
  );
};

export default Hand;
