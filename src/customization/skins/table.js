export const tableSkins = {
  'emerald-club': {
    id: 'emerald-club',
    name: 'Emerald Club',
    description: 'Deep green felt with cool blue rails.',
    tokens: {
      felt: '#14532d',
      border: 'rgba(34,197,94,0.35)',
      highlight: '#4ade80',
      panel: 'rgba(15,23,42,0.75)',
      text: '#f8fafc',
    },
  },
  'aurora-veil': {
    id: 'aurora-veil',
    name: 'Aurora Veil',
    description: 'Cosmic indigo felt with magenta trim.',
    tokens: {
      felt: '#1b184f',
      border: 'rgba(168,85,247,0.38)',
      highlight: '#c084fc',
      panel: 'rgba(24,20,45,0.78)',
      text: '#fce7f3',
    },
  },
  'summit-felt': {
    id: 'summit-felt',
    name: 'Summit Felt',
    description: 'Frosted teal felt with crisp glacier trim.',
    tokens: {
      felt: '#164e63',
      border: 'rgba(14,165,233,0.38)',
      highlight: '#38bdf8',
      panel: 'rgba(11,26,23,0.82)',
      text: '#ecfeff',
    },
  },
};

export const defaultTableSkinId = 'emerald-club';

export const listTableSkins = () => Object.values(tableSkins);

export const getTableSkinById = (id) => tableSkins[id] ?? tableSkins[defaultTableSkinId];
