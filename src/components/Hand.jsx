import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import Card from './Card.jsx';

const Hand = ({ cards, onPlayCard, disabled = false }) => {
  const { theme, scaleFont } = useCustomizationTokens();
  const clickHandler = disabled ? undefined : onPlayCard;

  return (
    <div>
      <h2 style={{ fontSize: scaleFont('18px'), marginBottom: '12px', color: theme.colors.textPrimary }}>Your Hand</h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={clickHandler} disabled={disabled} />
        ))}
        {cards.length === 0 && (
          <div style={{ color: theme.colors.textMuted, fontSize: scaleFont('13px') }}>Hand empty – draw from the deck.</div>
        )}
      </div>
    </div>
  );
};

export default Hand;
