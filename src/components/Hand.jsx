import { useCustomizationTokens } from '../customization/useCustomization.js';
import { scaleFont } from '../ui/typography.js';
import Card from './Card.jsx';

const Hand = ({
  cards,
  onPlayCard,
  disabled = false,
  showTitle = true,
  title = 'Your Hand',
}) => {
  const { theme, accessibility } = useCustomizationTokens();
  const fontScale = accessibility?.fontScale ?? 1;
  const clickHandler = disabled ? undefined : onPlayCard;
  const hasCards = cards.length > 0;
  const maxPerRow = 8;
  const rowOverlap = 58; // roughly half the card height
  const columnOverlap = 60;

  const rows = [];
  for (let index = 0; index < cards.length; index += maxPerRow) {
    rows.push(cards.slice(index, index + maxPerRow));
  }

  const cardHeight = 118;
  const effectiveRows = rows.length || 1;
  const stackHeight = cardHeight + Math.max(0, effectiveRows - 1) * (cardHeight - rowOverlap);

  const stackStyle = {
    position: 'relative',
    width: '100%',
    padding: '4px 0 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    overflow: 'hidden',
    minHeight: `${stackHeight}px`,
  };

  const rowStyle = (rowIndex) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    justifyContent: 'center',
    padding: `0 ${Math.max(0, columnOverlap / 2)}px`,
    marginTop: rowIndex === 0 ? 0 : `-${rowOverlap}px`,
    zIndex: rowIndex + 1,
    width: '100%',
  });

  return (
    <div>
      {showTitle && (
        <h2 style={{ fontSize: scaleFont('18px', fontScale), marginBottom: '12px', color: theme.colors.textPrimary }}>
          {title}
        </h2>
      )}
      <div style={stackStyle}>
        {hasCards ? (
          rows.map((rowCards, rowIndex) => (
            <div key={`row-${rowIndex}`} style={rowStyle(rowIndex)}>
              {rowCards.map((card, cardIndex) => {
                const overallIndex = rowIndex * maxPerRow + cardIndex;
                const key = card?.id ?? `${card?.suit ?? 'unknown'}-${card?.rank ?? 'blank'}-${overallIndex}`;
                return (
                  <div
                    key={key}
                    style={{
                      position: 'relative',
                      marginLeft: cardIndex === 0 ? 0 : `-${columnOverlap}px`,
                      zIndex: cardIndex + rowIndex * maxPerRow + 1,
                      pointerEvents: 'auto',
                    }}
                  >
                    <Card card={card} onClick={clickHandler} disabled={disabled} />
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div style={{ color: theme.colors.textMuted, fontSize: scaleFont('14px', fontScale) }}>
            Hand empty - draw from the deck.
          </div>
        )}
      </div>
    </div>
  );
};

export default Hand;

