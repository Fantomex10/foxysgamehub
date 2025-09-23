import { createRegistry } from '../../lib/registry.js';

const tableSkinRegistry = createRegistry({ name: 'table skin' });

const baseTableSkins = [
  {
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
  {
    id: 'aurora-veil',
    name: 'Aurora Veil',
    description: 'Cosmic indigo felt with magenta trim.',
    entitlement: {
      id: 'skin.table.aurora-veil',
      price: 350,
      currency: 'chips',
    },
    tokens: {
      felt: '#1b184f',
      border: 'rgba(168,85,247,0.38)',
      highlight: '#c084fc',
      panel: 'rgba(24,20,45,0.78)',
      text: '#fce7f3',
    },
  },
  {
    id: 'summit-felt',
    name: 'Summit Felt',
    description: 'Frosted teal felt with crisp glacier trim.',
    entitlement: {
      id: 'skin.table.summit-felt',
      price: 350,
      currency: 'chips',
    },
    tokens: {
      felt: '#164e63',
      border: 'rgba(14,165,233,0.38)',
      highlight: '#38bdf8',
      panel: 'rgba(11,26,23,0.82)',
      text: '#ecfeff',
    },
  },
];

tableSkinRegistry.registerMany(baseTableSkins);

export const registerTableSkin = (skin, options) => tableSkinRegistry.register(skin, options);

export const unregisterTableSkin = (id) => tableSkinRegistry.unregister(id);

export const listTableSkins = () => tableSkinRegistry.list();

export const getTableSkinById = (id) => tableSkinRegistry.get(id);

export const getDefaultTableSkinId = () => tableSkinRegistry.getDefaultKey();
