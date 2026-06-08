// COT Engine — Chemical Organization Theory computation with full tracing
// Pure TypeScript, no external dependencies.

export type ResourceId = string;
export type ReactionId = string;

export interface Reaction {
  id: ReactionId;
  inputs: ResourceId[];
  outputs: ResourceId[];
  label?: string;
}

export interface ReactionNetwork {
  resources: ResourceId[];
  reactions: Reaction[];
}

export type TraceStep =
  | { type: 'closure_start'; currentSet: ResourceId[] }
  | { type: 'reaction_fires'; reactionId: ReactionId; inputs: ResourceId[]; newResources: ResourceId[]; reason: string }
  | { type: 'reaction_skipped'; reactionId: ReactionId; missingInputs: ResourceId[]; reason: string }
  | { type: 'closure_reached'; finalSet: ResourceId[] }
  | { type: 'selfmaint_start'; currentSet: ResourceId[] }
  | { type: 'resource_not_produced'; resource: ResourceId; consumedBy: ReactionId[]; reason: string }
  | { type: 'resource_removed'; resource: ResourceId; reason: string }
  | { type: 'reaction_disabled'; reactionId: ReactionId; reason: string }
  | { type: 'selfmaint_reached'; finalSet: ResourceId[] }
  | { type: 'organization_check'; closedCheck: boolean; selfMaintCheck: boolean }
  | { type: 'organization_found'; resources: ResourceId[] }
  | { type: 'not_organization'; reason: string };

export interface COTResult {
  startSet: ResourceId[];
  closedSet: ResourceId[];
  organization: ResourceId[] | null;
  isOrganization: boolean;
  /** True when the closed set itself (without any resource removal) is already the organization */
  isExactOrganization: boolean;
  trace: TraceStep[];
}

/** Compute the closure of a set: repeatedly fire reactions whose inputs are all present. */
export function closureOf(
  network: ReactionNetwork,
  startSet: ResourceId[]
): { closedSet: ResourceId[]; trace: TraceStep[] } {
  const trace: TraceStep[] = [];
  const current = new Set<ResourceId>(startSet);

  trace.push({ type: 'closure_start', currentSet: [...current] });

  let changed = true;
  while (changed) {
    changed = false;
    for (const reaction of network.reactions) {
      const allInputsPresent = reaction.inputs.every(r => current.has(r));
      if (allInputsPresent) {
        const newResources = reaction.outputs.filter(r => !current.has(r));
        if (newResources.length > 0) {
          const inputDesc =
            reaction.inputs.length === 0
              ? '∅ (keine Inputs nötig)'
              : `[${reaction.inputs.join(', ')}]`;
          trace.push({
            type: 'reaction_fires',
            reactionId: reaction.id,
            inputs: reaction.inputs,
            newResources,
            reason: `Reaktion ${reaction.id}${reaction.label ? ` (${reaction.label})` : ''}: Inputs ${inputDesc} sind alle vorhanden → füge neue Ressourcen [${newResources.join(', ')}] hinzu`,
          });
          newResources.forEach(r => current.add(r));
          changed = true;
        }
      }
    }
  }

  trace.push({ type: 'closure_reached', finalSet: [...current] });
  return { closedSet: [...current], trace };
}

/**
 * Check self-maintenance: every resource that is consumed by any reaction in the
 * active set must also be produced by some reaction in the active set.
 * "Active" reactions are those whose inputs AND outputs are all within resourceSet.
 * Returns the set of resources that are consumed but NOT produced (violations).
 */
export function checkSelfMaintenance(
  network: ReactionNetwork,
  resourceSet: ResourceId[]
): { violations: ResourceId[]; producedBy: Map<ResourceId, ReactionId[]>; consumedBy: Map<ResourceId, ReactionId[]> } {
  const set = new Set(resourceSet);
  // Only consider reactions whose inputs AND outputs are all within resourceSet
  const activeReactions = network.reactions.filter(
    r => r.inputs.every(x => set.has(x)) && r.outputs.every(x => set.has(x))
  );

  const produced = new Map<ResourceId, ReactionId[]>();
  const consumed = new Map<ResourceId, ReactionId[]>();

  for (const r of activeReactions) {
    for (const res of r.outputs) {
      if (set.has(res)) {
        if (!produced.has(res)) produced.set(res, []);
        produced.get(res)!.push(r.id);
      }
    }
    for (const res of r.inputs) {
      if (set.has(res)) {
        if (!consumed.has(res)) consumed.set(res, []);
        consumed.get(res)!.push(r.id);
      }
    }
  }

  const violations: ResourceId[] = [];
  for (const res of resourceSet) {
    if (consumed.has(res) && !produced.has(res)) {
      violations.push(res);
    }
  }

  return { violations, producedBy: produced, consumedBy: consumed };
}

/**
 * Compute the organization: closure → self-maintenance cascade until stable → check.
 */
export function computeOrganization(
  network: ReactionNetwork,
  startSet: ResourceId[]
): COTResult {
  const trace: TraceStep[] = [];

  // Step 1: Compute closure
  const { closedSet, trace: closureTrace } = closureOf(network, startSet);
  trace.push(...closureTrace);

  // Step 2: Iteratively remove resources that are consumed but not produced
  let current = [...closedSet];
  trace.push({ type: 'selfmaint_start', currentSet: [...current] });

  let changed = true;
  while (changed) {
    changed = false;
    const { violations, consumedBy } = checkSelfMaintenance(network, current);
    if (violations.length > 0) {
      for (const res of violations) {
        const consumers = consumedBy.get(res) ?? [];
        trace.push({
          type: 'resource_not_produced',
          resource: res,
          consumedBy: consumers,
          reason: `Ressource "${res}" wird von Reaktion(en) [${consumers.join(', ')}] verbraucht, aber von keiner Reaktion in der aktuellen Menge produziert`,
        });
        trace.push({
          type: 'resource_removed',
          resource: res,
          reason: `Entferne "${res}" aus der Menge, da Selbsterhaltung verletzt`,
        });

        // Check which reactions get disabled by this removal
        const currentSet = new Set(current);
        for (const reaction of network.reactions) {
          if (reaction.inputs.includes(res) && reaction.inputs.every(r => currentSet.has(r))) {
            trace.push({
              type: 'reaction_disabled',
              reactionId: reaction.id,
              reason: `Reaktion ${reaction.id} wird deaktiviert, da Input "${res}" entfernt wurde`,
            });
          }
        }

        current = current.filter(r => r !== res);
        changed = true;
      }
    }
  }

  trace.push({ type: 'selfmaint_reached', finalSet: [...current] });

  // Step 3: Verify closure AND self-maintenance of the result
  const { closedSet: recheck } = closureOf(network, current);
  const isClosed = recheck.length === current.length && recheck.every(r => current.includes(r));
  const { violations: finalViolations } = checkSelfMaintenance(network, current);
  const isSelfMaintaining = finalViolations.length === 0;

  trace.push({
    type: 'organization_check',
    closedCheck: isClosed,
    selfMaintCheck: isSelfMaintaining,
  });

  const isOrganization = isClosed && isSelfMaintaining && current.length > 0;

  if (isOrganization) {
    trace.push({ type: 'organization_found', resources: [...current] });
  } else {
    const reasons: string[] = [];
    if (!isClosed) reasons.push('die Menge ist nicht abgeschlossen (Closure-Bedingung verletzt)');
    if (!isSelfMaintaining) reasons.push('die Menge ist nicht selbsterhaltend');
    if (current.length === 0) reasons.push('die resultierende Menge ist leer');
    trace.push({ type: 'not_organization', reason: reasons.join('; ') });
  }

  // Was the closed set already the organization (no resources removed)?
  const isExactOrganization =
    isOrganization &&
    current.length === closedSet.length &&
    current.every(r => closedSet.includes(r));

  return {
    startSet: [...startSet],
    closedSet,
    organization: isOrganization ? current : null,
    isOrganization,
    isExactOrganization,
    trace,
  };
}
