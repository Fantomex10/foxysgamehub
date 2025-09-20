export const cardSkins = {
  classic: {
    id: 'classic',
    name: 'Classic Deck',
    description: 'Neutral face cards with midnight backs.',
    tokens: {
      face: '#1f2937',
      back: '#2563eb',
      accent: '#38bdf8',
      text: '#f8fafc',
      border: 'rgba(148,163,184,0.4)',
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Deck',
    description: 'Violet gradients with neon pink highlights.',
    tokens: {
      face: '#1e1b4b',
      back: '#7c3aed',
      accent: '#f9a8d4',
      text: '#fce7f3',
      border: 'rgba(168,85,247,0.5)',
    },
  },
  summit: {
    id: 'summit',
    name: 'Summit Deck',
    description: 'Teal felt tones with crisp alpine accents.',
    tokens: {
      face: '#134e4a',
      back: '#0f766e',
      accent: '#2dd4bf',
      text: '#ecfeff',
      border: 'rgba(14,165,233,0.45)',
    },
  },
};

export const defaultCardSkinId = 'classic';

export const listCardSkins = () => Object.values(cardSkins);

export const getCardSkinById = (id) => cardSkins[id] ?? cardSkins[defaultCardSkinId];
