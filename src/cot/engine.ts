// COT Engine — Chemical Organization Theory
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
  | { type: 'closure_start'; set: ResourceId[] }
  | { type: 'reaction_fires_inside'; reactionId: ReactionId; label?: string }
  | { type: 'reaction_fires_outside'; reactionId: ReactionId; outsideResources: ResourceId[]; label?: string }
  | { type: 'reaction_not_applicable'; reactionId: ReactionId; missingInputs: ResourceId[] }
  | { type: 'closure_ok' }
  | { type: 'closure_fail'; violations: { reactionId: ReactionId; outsideResources: ResourceId[] }[] }
  | { type: 'selfmaint_start'; set: ResourceId[] }
  | { type: 'resource_produced_and_consumed'; resource: ResourceId; producedBy: ReactionId[]; consumedBy: ReactionId[] }
  | { type: 'resource_only_produced'; resource: ResourceId; producedBy: ReactionId[] }
  | { type: 'resource_not_consumed'; resource: ResourceId }
  | { type: 'resource_not_produced'; resource: ResourceId; consumedBy: ReactionId[] }
  | { type: 'selfmaint_ok' }
  | { type: 'selfmaint_fail'; violations: ResourceId[] }
  | { type: 'organization_found'; resources: ResourceId[] }
  | { type: 'not_organization'; closedCheck: boolean; selfMaintCheck: boolean };

export interface COTResult {
  startSet: ResourceId[];
  isOrganization: boolean;
  isClosed: boolean;
  isSelfMaintaining: boolean;
  closureViolations: { reactionId: ReactionId; outsideResources: ResourceId[] }[];
  selfMaintViolations: ResourceId[];
  trace: TraceStep[];
  // legacy fields kept for graph colouring — both equal startSet now
  closedSet: ResourceId[];
  organization: ResourceId[] | null;
  isExactOrganization: boolean;
}

/**
 * Check closure: for every reaction whose inputs are all in `set`,
 * all its outputs must also be in `set`.
 */
function checkClosure(
  network: ReactionNetwork,
  set: Set<ResourceId>
): {
  isClosed: boolean;
  violations: { reactionId: ReactionId; outsideResources: ResourceId[] }[];
  trace: TraceStep[];
} {
  const trace: TraceStep[] = [];
  trace.push({ type: 'closure_start', set: [...set] });

  const violations: { reactionId: ReactionId; outsideResources: ResourceId[] }[] = [];

  for (const r of network.reactions) {
    const missingInputs = r.inputs.filter(x => !set.has(x));
    if (missingInputs.length > 0) {
      trace.push({ type: 'reaction_not_applicable', reactionId: r.id, missingInputs });
      continue;
    }
    const outsideResources = r.outputs.filter(x => !set.has(x));
    if (outsideResources.length > 0) {
      trace.push({ type: 'reaction_fires_outside', reactionId: r.id, outsideResources, label: r.label });
      violations.push({ reactionId: r.id, outsideResources });
    } else {
      trace.push({ type: 'reaction_fires_inside', reactionId: r.id, label: r.label });
    }
  }

  if (violations.length === 0) {
    trace.push({ type: 'closure_ok' });
  } else {
    trace.push({ type: 'closure_fail', violations });
  }

  return { isClosed: violations.length === 0, violations, trace };
}

/**
 * Check self-maintenance: for every resource consumed by an applicable reaction
 * (inputs ⊆ set), that resource must also be produced by some applicable reaction.
 */
function checkSelfMaintenance(
  network: ReactionNetwork,
  set: Set<ResourceId>
): {
  isSelfMaintaining: boolean;
  violations: ResourceId[];
  trace: TraceStep[];
} {
  const trace: TraceStep[] = [];
  trace.push({ type: 'selfmaint_start', set: [...set] });

  const produced = new Map<ResourceId, ReactionId[]>();
  const consumed = new Map<ResourceId, ReactionId[]>();

  for (const r of network.reactions) {
    const applicable = r.inputs.every(x => set.has(x));
    if (!applicable) continue;
    for (const x of r.outputs) {
      if (set.has(x)) {
        if (!produced.has(x)) produced.set(x, []);
        produced.get(x)!.push(r.id);
      }
    }
    for (const x of r.inputs) {
      if (!consumed.has(x)) consumed.set(x, []);
      consumed.get(x)!.push(r.id);
    }
  }

  const violations: ResourceId[] = [];
  for (const res of set) {
    const isConsumed = consumed.has(res);
    const isProduced = produced.has(res);
    if (isConsumed && isProduced) {
      trace.push({ type: 'resource_produced_and_consumed', resource: res, producedBy: produced.get(res)!, consumedBy: consumed.get(res)! });
    } else if (isConsumed && !isProduced) {
      trace.push({ type: 'resource_not_produced', resource: res, consumedBy: consumed.get(res)! });
      violations.push(res);
    } else if (!isConsumed && isProduced) {
      trace.push({ type: 'resource_only_produced', resource: res, producedBy: produced.get(res)! });
    } else {
      trace.push({ type: 'resource_not_consumed', resource: res });
    }
  }

  if (violations.length === 0) {
    trace.push({ type: 'selfmaint_ok' });
  } else {
    trace.push({ type: 'selfmaint_fail', violations });
  }

  return { isSelfMaintaining: violations.length === 0, violations, trace };
}

/**
 * Check if a given set is a Chemical Organization:
 * it must be both closed and self-maintaining.
 */
export function computeOrganization(
  network: ReactionNetwork,
  startSet: ResourceId[]
): COTResult {
  const trace: TraceStep[] = [];
  const set = new Set(startSet);

  const closureResult = checkClosure(network, set);
  trace.push(...closureResult.trace);

  const smResult = checkSelfMaintenance(network, set);
  trace.push(...smResult.trace);

  const isOrganization = closureResult.isClosed && smResult.isSelfMaintaining && startSet.length > 0;

  trace.push(
    isOrganization
      ? { type: 'organization_found', resources: startSet }
      : { type: 'not_organization', closedCheck: closureResult.isClosed, selfMaintCheck: smResult.isSelfMaintaining }
  );

  return {
    startSet,
    isOrganization,
    isClosed: closureResult.isClosed,
    isSelfMaintaining: smResult.isSelfMaintaining,
    closureViolations: closureResult.violations,
    selfMaintViolations: smResult.violations,
    trace,
    // legacy compat
    closedSet: startSet,
    organization: isOrganization ? startSet : null,
    isExactOrganization: isOrganization,
  };
}
