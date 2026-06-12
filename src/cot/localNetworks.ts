import type { ReactionNetwork, ResourceId } from './engine';

export interface SavedNetwork {
  name: string;
  network: ReactionNetwork;
  startSet: ResourceId[];
  savedAt: number;
}

const STORAGE_KEY = 'cot_custom_networks';

export function getSavedNetworks(): SavedNetwork[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNetwork(name: string, network: ReactionNetwork, startSet: ResourceId[]): SavedNetwork[] {
  const existing = getSavedNetworks().filter(n => n.name !== name);
  const updated = [...existing, { name, network, startSet, savedAt: Date.now() }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteNetwork(name: string): SavedNetwork[] {
  const updated = getSavedNetworks().filter(n => n.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
