export const pieceSkins = {
  classic: {
    id: 'classic',
    name: 'Classic Tokens',
    description: 'Minimal chips with cyan highlights.',
    tokens: {
      primary: '#38bdf8',
      secondary: '#0f172a',
      highlight: '#fef3c7',
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Tokens',
    description: 'Iridescent counters with neon glow.',
    tokens: {
      primary: '#a855f7',
      secondary: '#1e1b4b',
      highlight: '#f472b6',
    },
  },
  summit: {
    id: 'summit',
    name: 'Summit Tokens',
    description: 'Frosted markers inspired by alpine sunrises.',
    tokens: {
      primary: '#0ea5e9',
      secondary: '#0b1a17',
      highlight: '#f97316',
    },
  },
};

export const defaultPieceSkinId = 'classic';

export const listPieceSkins = () => Object.values(pieceSkins);

export const getPieceSkinById = (id) => pieceSkins[id] ?? pieceSkins[defaultPieceSkinId];
