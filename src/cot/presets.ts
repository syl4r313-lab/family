import type { ReactionNetwork } from './engine';

export const ecosystemNetwork: ReactionNetwork = {
  resources: ['sunlight', 'plants', 'CO2', 'minerals', 'oxygen', 'animals', 'detritus', 'bacteria', 'heat'],
  reactions: [
    {
      id: 'r1',
      inputs: ['plants', 'sunlight', 'CO2', 'minerals'],
      outputs: ['plants', 'oxygen', 'heat'],
      label: 'Photosynthese',
    },
    {
      id: 'r2',
      inputs: ['plants', 'animals', 'oxygen'],
      outputs: ['animals', 'CO2', 'detritus', 'heat'],
      label: 'Konsum / Atmung',
    },
    {
      id: 'r3',
      inputs: ['detritus', 'bacteria'],
      outputs: ['bacteria', 'CO2', 'minerals', 'heat'],
      label: 'Zersetzung',
    },
    {
      id: 'r4',
      inputs: ['heat'],
      outputs: [],
      label: 'Wärmeabgabe (Senke)',
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

// Minimal closed cycle — always an organization
const cycleNetwork: ReactionNetwork = {
  resources: ['A', 'B', 'C'],
  reactions: [
    { id: 'r1', inputs: ['A'], outputs: ['B'], label: 'A → B' },
    { id: 'r2', inputs: ['B'], outputs: ['C'], label: 'B → C' },
    { id: 'r3', inputs: ['C'], outputs: ['A'], label: 'C → A  ← schließt den Kreislauf' },
  ],
};

// Open chain with sink — never an organization
const noOrgNetwork: ReactionNetwork = {
  resources: ['A', 'B', 'C'],
  reactions: [
    { id: 'r1', inputs: ['A'], outputs: ['B'], label: 'A → B' },
    { id: 'r2', inputs: ['B'], outputs: ['C'], label: 'B → C' },
    { id: 'r3', inputs: ['C'], outputs: [], label: 'C → ∅  (Senke — C wird nie produziert)' },
  ],
};

export const presets: Record<string, { name: string; network: ReactionNetwork; defaultStart: string[]; description: string }> = {
  cycle: {
    name: '✓ Kreislauf (A→B→C→A)',
    network: cycleNetwork,
    defaultStart: ['A'],
    description: 'Geschlossener Kreislauf: jede Ressource wird produziert und verbraucht. Immer eine Organisation.',
  },
  noorg: {
    name: '✗ Offene Kette (C→∅)',
    network: noOrgNetwork,
    defaultStart: ['A', 'B', 'C'],
    description: 'Offene Kette mit Senke: C wird verbraucht aber nie produziert. Cascade leert die Menge → keine Organisation.',
  },
  ecosystem: {
    name: 'Ökosystem',
    network: ecosystemNetwork,
    defaultStart: ['sunlight', 'plants', 'animals', 'bacteria', 'CO2', 'minerals'],
    description: 'Entferne sunlight aus der Startmenge — dann kann Photosynthese nicht feuern und das System bricht zusammen.',
  },
  abstract: {
    name: 'Heylighen (2013)',
    network: abstractNetwork,
    defaultStart: ['a', 'b', 'c'],
    description: 'Abstraktes Netzwerk aus der COT-Literatur.',
  },
};

