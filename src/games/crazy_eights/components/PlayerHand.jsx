// =================================================================================
// FILE: src/components/PlayerHand.jsx
// =================================================================================
import React, { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import Card from './Card';
import { useScreenSize } from '../../../hooks/useScreenSize';

// Helper function to split the hand into rows for better display
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
  arr.slice(i * size, i * size + size)
);

const DraggableCard = ({ card, isMyTurn }) => {
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
        id: `${card.rank}-${card.suit}`,
        data: { card },
        disabled: !isMyTurn,
    });

    // While dragging, we render a placeholder to prevent the hand from shifting
    if (isDragging) {
        return <div ref={setNodeRef} style={{width: 'var(--card-width)'}} />;
    }

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        touchAction: 'none',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
             <Card card={card} disabled={!isMyTurn} />
        </div>
    );
};


const PlayerHand = memo(({ cards, isMyTurn }) => {
    const { width } = useScreenSize();

    if (cards.length === 0) {
        return <div className="w-full flex justify-center items-center p-2" style={{minHeight: 'var(--card-height)'}}><p className="text-gray-400">Your hand is empty.</p></div>;
    }

    const getCardsPerRow = () => {
        if (width < 640) return 7;   // Mobile
        if (width < 1024) return 10; // Tablet
        return 14;                   // Desktop
    };
    const cardsPerRow = getCardsPerRow();
    const cardRows = chunk(cards, cardsPerRow);

    return (
        <div className="w-full flex flex-col items-center p-2">
            {cardRows.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    // VERTICAL STACKING: Pulls this entire row UP by 55% of the card's HEIGHT.
                    className={`flex justify-center ${rowIndex > 0 ? 'mt-[calc(var(--card-height)*-0.55)]' : ''}`}
                    style={{ zIndex: rowIndex }}
                >
                    {row.map((card, cardIndex) => {
                        const overallCardIndex = rowIndex * cardsPerRow + cardIndex;
                        return (
                            <div
                                key={`${card.rank}-${card.suit}-${overallCardIndex}`}
                                // HORIZONTAL FANNING: Pulls this card LEFT by 50% of the card's WIDTH.
                                className="-ml-[calc(var(--card-width)_/_2)] first:ml-0"
                                style={{ zIndex: overallCardIndex }}
                            >
                                <DraggableCard card={card} isMyTurn={isMyTurn} />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});

export default PlayerHand;
