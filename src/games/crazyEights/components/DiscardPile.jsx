import { useCustomizationTokens } from '../../../customization/CustomizationContext.jsx';
import { SUIT_COLORS } from '../../../lib/cards.js';
import Card from '../../../components/Card.jsx';

const DiscardPile = ({ cards, activeSuit }) => {
  const { theme, scaleFont, cards: cardTokens } = useCustomizationTokens();
  const topCard = cards.length ? cards[cards.length - 1] : null;
  const showActiveSuit = topCard && topCard.rank === '8' && activeSuit;
  const suitPalette = cardTokens?.suits ?? {};
  const activeSuitColor = showActiveSuit
    ? suitPalette[activeSuit] ?? SUIT_COLORS[activeSuit] ?? theme.colors.accentPrimary
    : theme.colors.accentPrimary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <Card card={topCard} disabled />
      <span style={{ fontSize: scaleFont('12px'), color: theme.colors.textMuted }}>
        Discard pile · {cards.length}
      </span>
      {showActiveSuit && (
        <span style={{ fontSize: scaleFont('12px'), color: activeSuitColor }}>
          Active suit: {activeSuit}
        </span>
      )}
    </div>
  );
};

export default DiscardPile;
