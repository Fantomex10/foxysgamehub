// =================================================================================
// FILE: src/utils/handSorter.js
// =================================================================================
// This utility file contains the logic for sorting a player's hand.
// =================================================================================
export const sortHand = (hand, sortType = 'suit') => {
    if (!hand || hand.length === 0) return [];

    const rankOrder = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    const suitOrderStandard = ['clubs', 'diamonds', 'hearts', 'spades'];
    const suitOrderColorContrast = ['clubs', 'diamonds', 'spades', 'hearts'];

    const activeSuitOrder = sortType === 'suit' ? suitOrderStandard : suitOrderColorContrast;

    const handCopy = [...hand];
    handCopy.sort((a, b) => {
        const suitComparison = activeSuitOrder.indexOf(a.suit) - activeSuitOrder.indexOf(b.suit);
        if (suitComparison !== 0) {
            return suitComparison;
        }
        return rankOrder[a.rank] - rankOrder[b.rank];
    });
    return handCopy;
};
