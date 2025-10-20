import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';
import Card from './Card.jsx';

const Hand = ({ cards, onPlayCard, disabled = false }) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const clickHandler = disabled ? undefined : onPlayCard;

  return (
    <div>
      <h2 style={{ fontSize: scaleFont('18px', fontScale), marginBottom: '12px', color: theme.colors.textPrimary }}>
        Your Hand
      </h2>
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
          <div style={{ color: theme.colors.textMuted, fontSize: scaleFont('14px', fontScale) }}>
            Hand empty – draw from the deck.
          </div>
        )}
      </div>
    </div>
  );
};

export default Hand;

