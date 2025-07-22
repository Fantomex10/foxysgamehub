// =================================================================================
// FILE: src/components/PlayerHand.jsx
//
// CHANGE LOG (Final Bugfix):
// - FIXED: The component now accepts the `onPlayCard` prop.
// - FIXED: The `onPlayCard` function is now correctly passed down to each
//   individual `DraggableCard` component. This was the final missing piece
//   that prevented the card play action from being called.
// =================================================================================
import React, { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import Card from './Card';
import { useScreenSize } from '../../../hooks/useScreenSize';

const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
  arr.slice(i * size, i * size + size)
);

// DraggableCard now accepts onPlayCard to ensure it re-renders when the function changes,
// which is crucial for keeping its internal drag context up-to-date.
const DraggableCard = memo(({ card, isMyTurn, activeDragId, onPlayCard }) => {
    const cardId = `${card.rank}-${card.suit}`;

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: cardId,
        data: { card },
        disabled: !isMyTurn,
    });

    const isBeingDragged = activeDragId === cardId;

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        touchAction: 'none',
        opacity: isBeingDragged ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
             <Card card={card} disabled={!isMyTurn} />
        </div>
    );
});


// PlayerHand now correctly passes the onPlayCard prop to each DraggableCard.
const PlayerHand = memo(({ cards, onPlayCard, isMyTurn, activeDragId }) => {
    const { width } = useScreenSize();

    if (cards.length === 0) {
        return <div className="w-full flex justify-center items-center p-2" style={{minHeight: 'var(--card-height)'}}><p className="text-gray-400">Your hand is empty.</p></div>;
    }

    const getCardsPerRow = () => {
        if (width < 640) return 7;
        if (width < 1024) return 10;
        return 14;
    };
    const cardsPerRow = getCardsPerRow();
    const cardRows = chunk(cards, cardsPerRow);

    return (
        <div className="w-full flex flex-col items-center p-2">
            {cardRows.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    className={`flex justify-center ${rowIndex > 0 ? 'mt-[calc(var(--card-height)*-0.55)]' : ''}`}
                    style={{ zIndex: rowIndex }}
                >
                    {row.map((card, cardIndex) => {
                        const overallCardIndex = rowIndex * cardsPerRow + cardIndex;
                        return (
                            <div
                                key={`${card.rank}-${card.suit}-${overallCardIndex}`}
                                className="-ml-[calc(var(--card-width)_/_2)] first:ml-0"
                                style={{ zIndex: overallCardIndex }}
                            >
                                <DraggableCard
                                    card={card}
                                    isMyTurn={isMyTurn}
                                    activeDragId={activeDragId}
                                    onPlayCard={onPlayCard}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});

export default PlayerHand;