import { useCustomizationTokens } from '../customization/CustomizationContext.jsx';
import Card from './Card.jsx';

const DiscardPile = ({ cards, activeSuit }) => {
  const { theme } = useCustomizationTokens();
  const topCard = cards.length ? cards[cards.length - 1] : null;
  const showActiveSuit = topCard && topCard.rank === '8' && activeSuit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <Card card={topCard} disabled />
      <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>
        Discard pile · {cards.length}
      </span>
      {showActiveSuit && (
        <span style={{ fontSize: '12px', color: theme.colors.accentPrimary }}>
          Active suit: {activeSuit}
        </span>
      )}
    </div>
  );
};

export default DiscardPile;
