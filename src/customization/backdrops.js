export const backdrops = {
  'nebula-night': {
    id: 'nebula-night',
    name: 'Nebula Night',
    description: 'Soft starfield gradient with teal highlights.',
    tokens: {
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 45%, #0b1120 100%)',
      overlay: 'radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 60%)',
    },
  },
  'aurora-sky': {
    id: 'aurora-sky',
    name: 'Aurora Sky',
    description: 'Violet ribbons drifting across midnight blues.',
    tokens: {
      background: 'linear-gradient(165deg, #12071d 0%, #1b1035 38%, #0a0f2b 100%)',
      overlay: 'radial-gradient(circle at top, rgba(168,85,247,0.28), transparent 55%)',
    },
  },
  'summit-horizon': {
    id: 'summit-horizon',
    name: 'Summit Horizon',
    description: 'Cool twilight slopes with sunrise embers.',
    tokens: {
      background: 'linear-gradient(170deg, #051412 0%, #0b1a17 42%, #112a29 100%)',
      overlay: 'radial-gradient(circle at bottom, rgba(249,115,22,0.18), transparent 55%)',
    },
  },
};

export const defaultBackdropId = 'nebula-night';

export const listBackdrops = () => Object.values(backdrops);

export const getBackdropById = (id) => backdrops[id] ?? backdrops[defaultBackdropId];
