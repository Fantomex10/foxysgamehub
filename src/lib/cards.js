export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

export const SUIT_ICONS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const SUIT_COLORS = {
  hearts: '#f87171',
  diamonds: '#facc15',
  clubs: '#38bdf8',
  spades: '#f8fafc',
};

let nextId = 1;

export const createDeck = () => {
  nextId = 1; // reset for deterministic ids between games
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}-${nextId++}`,
        suit,
        rank,
      });
    }
  }
  return deck;
};

export const shuffle = (cards) => {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const initialiseGame = (handSize = 5) => {
  const deck = shuffle(createDeck());
  const hand = deck.slice(0, handSize);
  const remaining = deck.slice(handSize);
  const firstDiscard = remaining.shift();
  return {
    hand,
    drawPile: remaining,
    discardPile: firstDiscard ? [firstDiscard] : [],
  };
};
