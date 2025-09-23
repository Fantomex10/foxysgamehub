import { createRegistry } from '../../lib/registry.js';

const cardSkinRegistry = createRegistry({ name: 'card skin' });

const baseCardSkins = [
  {
    id: 'classic',
    name: 'Classic Deck',
    description: 'Neutral face cards with midnight backs.',
    tokens: {
      face: '#1f2937',
      back: '#2563eb',
      accent: '#38bdf8',
      text: '#f8fafc',
      border: 'rgba(148,163,184,0.4)',
      suits: {
        hearts: '#f87171',
        diamonds: '#facc15',
        clubs: '#38bdf8',
        spades: '#f8fafc',
      },
    },
  },
  {
    id: 'aurora',
    name: 'Aurora Deck',
    description: 'Violet gradients with neon pink highlights.',
    entitlement: {
      id: 'skin.cards.aurora',
      price: 450,
      currency: 'chips',
    },
    tokens: {
      face: '#1e1b4b',
      back: '#7c3aed',
      accent: '#f9a8d4',
      text: '#fce7f3',
      border: 'rgba(168,85,247,0.5)',
      suits: {
        hearts: '#f472b6',
        diamonds: '#f9a8d4',
        clubs: '#a855f7',
        spades: '#c4b5fd',
      },
    },
  },
  {
    id: 'summit',
    name: 'Summit Deck',
    description: 'Teal felt tones with crisp alpine accents.',
    entitlement: {
      id: 'skin.cards.summit',
      price: 450,
      currency: 'chips',
    },
    tokens: {
      face: '#134e4a',
      back: '#0f766e',
      accent: '#2dd4bf',
      text: '#ecfeff',
      border: 'rgba(14,165,233,0.45)',
      suits: {
        hearts: '#f97316',
        diamonds: '#facc15',
        clubs: '#0ea5e9',
        spades: '#ecfeff',
      },
    },
  },
];

cardSkinRegistry.registerMany(baseCardSkins);

export const registerCardSkin = (skin, options) => cardSkinRegistry.register(skin, options);

export const unregisterCardSkin = (id) => cardSkinRegistry.unregister(id);

export const listCardSkins = () => cardSkinRegistry.list();

export const getCardSkinById = (id) => cardSkinRegistry.get(id);

export const getDefaultCardSkinId = () => cardSkinRegistry.getDefaultKey();
