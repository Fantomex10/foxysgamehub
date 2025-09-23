import { createRegistry } from '../../lib/registry.js';

const pieceSkinRegistry = createRegistry({ name: 'piece skin' });

const basePieceSkins = [
  {
    id: 'classic',
    name: 'Classic Tokens',
    description: 'Minimal chips with cyan highlights.',
    tokens: {
      primary: '#38bdf8',
      secondary: '#0f172a',
      highlight: '#fef3c7',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora Tokens',
    description: 'Iridescent counters with neon glow.',
    entitlement: {
      id: 'skin.pieces.aurora',
      price: 250,
      currency: 'chips',
    },
    tokens: {
      primary: '#a855f7',
      secondary: '#1e1b4b',
      highlight: '#f472b6',
    },
  },
  {
    id: 'summit',
    name: 'Summit Tokens',
    description: 'Frosted markers inspired by alpine sunrises.',
    entitlement: {
      id: 'skin.pieces.summit',
      price: 250,
      currency: 'chips',
    },
    tokens: {
      primary: '#0ea5e9',
      secondary: '#0b1a17',
      highlight: '#f97316',
    },
  },
];

pieceSkinRegistry.registerMany(basePieceSkins);

export const registerPieceSkin = (skin, options) => pieceSkinRegistry.register(skin, options);

export const unregisterPieceSkin = (id) => pieceSkinRegistry.unregister(id);

export const listPieceSkins = () => pieceSkinRegistry.list();

export const getPieceSkinById = (id) => pieceSkinRegistry.get(id);

export const getDefaultPieceSkinId = () => pieceSkinRegistry.getDefaultKey();
