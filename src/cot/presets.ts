import type { ReactionNetwork } from './engine';

export const ecosystemNetwork: ReactionNetwork = {
  resources: ['sunlight', 'plants', 'CO2', 'minerals', 'oxygen', 'animals', 'detritus', 'bacteria', 'heat'],
  reactions: [
    {
      id: 'r1',
      inputs: [],
      outputs: ['sunlight'],
      label: 'Sonneneinstrahlung (von außen)',
    },
    {
      id: 'r2',
      inputs: ['plants', 'sunlight', 'CO2', 'minerals'],
      outputs: ['plants', 'oxygen', 'heat'],
      label: 'Photosynthese',
    },
    {
      id: 'r3',
      inputs: ['plants', 'animals', 'oxygen'],
      outputs: ['animals', 'CO2', 'detritus', 'heat'],
      label: 'Konsum / Atmung',
    },
    {
      id: 'r4',
      inputs: ['detritus', 'bacteria'],
      outputs: ['bacteria', 'CO2', 'minerals', 'heat'],
      label: 'Zersetzung',
    },
    {
      id: 'r5',
      inputs: ['heat'],
      outputs: [],
      label: 'Wärmeabgabe',
    },
  ],
};

// Abstract cycle from Heylighen (2013) Table 1
export const abstractNetwork: ReactionNetwork = {
  resources: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
  reactions: [
    { id: 'r1', inputs: ['a'], outputs: ['b', 'c'], label: 'a → b + c' },
    { id: 'r2', inputs: ['b'], outputs: ['d'], label: 'b → d' },
    { id: 'r3', inputs: ['c'], outputs: ['e'], label: 'c → e' },
    { id: 'r4', inputs: ['d', 'e'], outputs: ['a', 'f'], label: 'd + e → a + f' },
    { id: 'r5', inputs: ['f'], outputs: ['g'], label: 'f → g' },
    { id: 'r6', inputs: ['g'], outputs: ['h', 'i'], label: 'g → h + i' },
    { id: 'r7', inputs: ['h'], outputs: ['j'], label: 'h → j' },
    { id: 'r8', inputs: ['i'], outputs: ['j'], label: 'i → j' },
    { id: 'r9', inputs: ['j'], outputs: ['f'], label: 'j → f' },
    { id: 'r10', inputs: ['a', 'f'], outputs: ['a', 'g'], label: 'a + f → a + g' },
  ],
};

export const presets: Record<string, { name: string; network: ReactionNetwork; defaultStart: string[] }> = {
  ecosystem: {
    name: 'Ökosystem',
    network: ecosystemNetwork,
    defaultStart: ['plants', 'animals', 'bacteria', 'CO2', 'minerals'],
  },
  abstract: {
    name: 'Abstraktes Netzwerk (Heylighen Table 1)',
    network: abstractNetwork,
    defaultStart: ['a', 'b', 'c'],
  },
};
