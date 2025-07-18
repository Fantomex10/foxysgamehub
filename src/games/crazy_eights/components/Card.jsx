// =================================================================================
// FILE: src/components/Card.jsx
// =================================================================================
import React, { forwardRef, memo } from 'react';

const Card = memo(forwardRef(({ card, disabled, className = '' }, ref) => {
    if (!card) return null;

    const cardStyle = {
        width: 'var(--card-width)',
        height: 'var(--card-height)',
    };
    const rankStyle = { fontSize: 'var(--card-font-rank)' };
    const suitStyle = { fontSize: 'var(--card-font-suit)' };
    const symbolStyle = { fontSize: 'var(--card-font-symbol)' };

    if (card.suit === 'special' && card.rank === 'DRAW') {
        return (
            <div
                ref={ref}
                style={cardStyle}
                className={`relative bg-red-600 text-white rounded-lg shadow-md flex items-center justify-center font-bold select-none border-2 border-red-800 transition-colors ${!disabled ? 'hover:bg-red-700' : ''} ${className}`}
            >
                <span className="text-xl md:text-2xl">DRAW</span>
            </div>
        );
    }

    const isRedSuit = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitSymbol = { 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣', 'spades': '♠' }[card.suit];
    const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-grab';

    return (
        <div
            ref={ref}
            style={cardStyle}
            className={`relative bg-white rounded-lg shadow-md flex flex-col justify-between font-bold select-none border-2 border-gray-300 transition-all duration-300 ease-in-out ${cursorClass} ${className}`}
        >
            <div className={`absolute top-1 left-1 text-center ${isRedSuit ? 'text-red-600' : 'text-black'}`}>
                <div style={rankStyle} className="leading-none">{card.rank}</div>
                <div style={suitStyle} className="leading-none">{suitSymbol}</div>
            </div>
            <div style={symbolStyle} className={`flex items-center justify-center h-full ${isRedSuit ? 'text-red-600' : 'text-black'}`}>{suitSymbol}</div>
            <div className={`absolute bottom-1 right-1 text-center transform rotate-180 ${isRedSuit ? 'text-red-600' : 'text-black'}`}>
                <div style={rankStyle} className="leading-none">{card.rank}</div>
                <div style={suitStyle} className="leading-none">{suitSymbol}</div>
            </div>
        </div>
    );
}));

export default Card;
