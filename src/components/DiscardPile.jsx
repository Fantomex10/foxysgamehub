import Card from './Card.jsx';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
};

const DiscardPile = ({ cards, activeSuit }) => {
  const topCard = cards.length ? cards[cards.length - 1] : null;
  const showActiveSuit = topCard && topCard.rank === '8' && activeSuit;

  return (
    <div style={containerStyle}>
      <Card card={topCard} disabled />
      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
        Discard pile · {cards.length}
      </span>
      {showActiveSuit && (
        <span style={{ fontSize: '12px', color: '#38bdf8' }}>
          Active suit: {activeSuit}
        </span>
      )}
    </div>
  );
};

export default DiscardPile;
