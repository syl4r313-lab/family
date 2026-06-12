import { useEffect, useRef, useState } from 'react';
import type { ReactionNetwork, Reaction, ResourceId, COTResult } from './engine';
import { computeOrganization } from './engine';
import { presets } from './presets';

interface Props {
  network: ReactionNetwork;
  startSet: ResourceId[];
  result: COTResult | null;
  onNetworkChange: (network: ReactionNetwork) => void;
  onStartSetChange: (startSet: ResourceId[]) => void;
  onAnalyze: () => void;
}

// Per-reaction color palette (muted/varied hues fitting the academic aesthetic)
const REACTION_PALETTE = [
  '#9A3412', '#0F766E', '#7C3AED', '#B45309', '#1D4ED8',
  '#BE123C', '#15803D', '#A21CAF', '#0369A1', '#854D0E',
];
function reactionColor(index: number): string {
  return REACTION_PALETTE[index % REACTION_PALETTE.length];
}

function parseReaction(raw: string, id: string): Reaction | null {
  // Accept: "a + b → c + d" or "a + b -> c + d"
  const normalized = raw.replace(/→/g, '->').replace(/=>/g, '->');
  const parts = normalized.split('->');
  if (parts.length !== 2) return null;
  const parse = (s: string) =>
    s
      .split('+')
      .map(x => x.trim())
      .filter(x => x.length > 0 && x !== '∅' && x !== 'nothing');
  return {
    id,
    inputs: parse(parts[0]),
    outputs: parse(parts[1]),
    label: raw.trim(),
  };
}

function reactionToString(r: Reaction): string {
  const inp = r.inputs.length === 0 ? '∅' : r.inputs.join(' + ');
  const out = r.outputs.length === 0 ? '∅' : r.outputs.join(' + ');
  return `${inp} → ${out}`;
}

// ---------------------------------------------------------------------------
// Drag & Drop reaction builder
// ---------------------------------------------------------------------------

function DropZone({
  label,
  items,
  onChange,
  dragging,
  setDragging,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  dragging: string | null;
  setDragging: (v: string | null) => void;
}) {
  const [over, setOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    const r = dragging ?? e.dataTransfer.getData('text/plain');
    if (r) onChange([...items, r]);
    setDragging(null);
  };

  return (
    <div>
      <div className="text-[#9A3412] text-xs font-bold mb-1">{label}</div>
      <div
        onDragOver={e => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        className={`min-h-[64px] rounded p-2 flex flex-wrap gap-1.5 content-start border transition-all ${
          over ? 'border-[#9A3412] bg-[#9A3412]/5' : 'border-[#D4C4B0] bg-[#FFFDF8]'
        }`}
      >
        {items.length === 0 ? (
          <span className="text-[#2A1810]/40 text-xs italic select-none">
            ziehe Ressourcen hierher…
          </span>
        ) : (
          items.map((r, i) => (
            <span
              key={`${r}-${i}`}
              className="flex items-center gap-1 border border-[#9A3412] text-[#2A1810] bg-white text-xs px-2 py-1 rounded"
            >
              {r}
              <button
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="text-[#9A3412] hover:text-[#BE123C] ml-1"
                title="Entfernen"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function ReactionBuilder({
  resources,
  onAddReaction,
}: {
  resources: string[];
  onAddReaction: (inputs: string[], outputs: string[]) => void;
}) {
  const [inputs, setInputs] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  const disabled = inputs.length === 0 || outputs.length === 0;

  return (
    <div className="space-y-3">
      <div className="text-[#9A3412] text-xs font-bold uppercase tracking-wider">
        Ressourcen — in die Zonen ziehen
      </div>
      <div className="flex flex-wrap gap-2">
        {resources.length === 0 && (
          <span className="text-[#2A1810]/40 text-xs italic">keine Ressourcen</span>
        )}
        {resources.map(r => (
          <span
            key={r}
            draggable
            onDragStart={e => {
              setDragging(r);
              e.dataTransfer.setData('text/plain', r);
            }}
            onDragEnd={() => setDragging(null)}
            className="cursor-grab active:cursor-grabbing border border-[#9A3412] text-[#2A1810] bg-white text-xs px-2 py-1 rounded select-none"
          >
            {r}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DropZone label="INPUTS" items={inputs} onChange={setInputs} dragging={dragging} setDragging={setDragging} />
        <DropZone label="OUTPUTS" items={outputs} onChange={setOutputs} dragging={dragging} setDragging={setDragging} />
      </div>

      {!disabled && (
        <div className="font-mono text-[#2A1810] text-sm">
          {inputs.join(' + ')} → {outputs.join(' + ')}
        </div>
      )}

      <button
        onClick={() => {
          onAddReaction(inputs, outputs);
          setInputs([]);
          setOutputs([]);
        }}
        disabled={disabled}
        className="w-full px-3 py-1.5 bg-[#9A3412] text-white font-bold text-sm rounded hover:bg-[#7c2a0e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        + Reaktion hinzufügen
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inflow / Outflow builder
// ---------------------------------------------------------------------------

function FlowBuilder({
  resources,
  onAddFlow,
}: {
  resources: string[];
  onAddFlow: (kind: 'inflow' | 'outflow', resource: string) => void;
}) {
  const [mode, setMode] = useState<'inflow' | 'outflow' | null>(null);
  const [picked, setPicked] = useState('');
  const [custom, setCustom] = useState('');

  const submit = () => {
    const res = custom.trim() || picked;
    if (!res || !mode) return;
    onAddFlow(mode, res);
    setMode(null);
    setPicked('');
    setCustom('');
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode(mode === 'inflow' ? null : 'inflow'); setPicked(''); setCustom(''); }}
          className={`flex-1 px-3 py-1.5 rounded text-sm font-bold border transition-colors ${
            mode === 'inflow'
              ? 'bg-[#9A3412] text-white border-[#9A3412]'
              : 'bg-white text-[#9A3412] border-[#9A3412] hover:bg-[#9A3412]/5'
          }`}
        >
          + Inflow (∅ → Ressource)
        </button>
        <button
          onClick={() => { setMode(mode === 'outflow' ? null : 'outflow'); setPicked(''); setCustom(''); }}
          className={`flex-1 px-3 py-1.5 rounded text-sm font-bold border transition-colors ${
            mode === 'outflow'
              ? 'bg-[#9A3412] text-white border-[#9A3412]'
              : 'bg-white text-[#9A3412] border-[#9A3412] hover:bg-[#9A3412]/5'
          }`}
        >
          + Outflow (Ressource → ∅)
        </button>
      </div>

      {mode && (
        <div className="bg-[#FFFDF8] border border-[#D4C4B0] rounded p-3 space-y-2">
          <div className="text-[#9A3412] text-xs font-bold">
            {mode === 'inflow' ? 'Welche Ressource fließt herein?' : 'Welche Ressource fließt heraus?'}
          </div>
          <div className="flex flex-wrap gap-2">
            {resources.map(r => (
              <button
                key={r}
                onClick={() => { setPicked(r); setCustom(''); }}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  picked === r
                    ? 'bg-[#9A3412] text-white border-[#9A3412]'
                    : 'bg-white text-[#2A1810] border-[#D4C4B0] hover:border-[#9A3412]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={e => { setCustom(e.target.value); setPicked(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="…oder neue Ressource"
              className="flex-1 bg-white border border-[#D4C4B0] text-[#2A1810] text-sm rounded px-3 py-1.5 placeholder-[#2A1810]/40 focus:outline-none focus:border-[#9A3412]"
            />
            <button
              onClick={submit}
              disabled={!custom.trim() && !picked}
              className="px-3 py-1.5 bg-[#9A3412] text-white font-bold text-sm rounded hover:bg-[#7c2a0e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG network graph (simple spring layout)
// ---------------------------------------------------------------------------

interface GraphNode {
  id: string;
  kind: 'resource' | 'reaction';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function NetworkGraph({ network, startSet, result }: { network: ReactionNetwork; startSet: ResourceId[]; result: COTResult | null }) {
  const W = 600;
  const H = 400;
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const seedRef = useRef(0);

  // Map reaction id -> index (for stable colors)
  const reactionIndex = new Map<string, number>();
  network.reactions.forEach((rx, i) => reactionIndex.set(rx.id, i));

  // Build edges: reaction -> input (in), reaction -> output (out)
  const edges: { from: string; to: string; type: 'in' | 'out'; rxId: string }[] = [];
  for (const rx of network.reactions) {
    for (const i of rx.inputs) edges.push({ from: `rx:${rx.id}`, to: `res:${i}`, type: 'in', rxId: rx.id });
    for (const o of rx.outputs) edges.push({ from: `rx:${rx.id}`, to: `res:${o}`, type: 'out', rxId: rx.id });
  }

  const nodeIds =
    network.resources.map(r => `res:${r}`).concat(network.reactions.map(rx => `rx:${rx.id}`));
  const layoutKey = nodeIds.join('|') + '#' + edges.map(e => e.from + e.to).join('|');

  useEffect(() => {
    // Deterministic-ish pseudo random init
    let seed = (seedRef.current = layoutKey.length + 1);
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const nodes: GraphNode[] = nodeIds.map(id => ({
      id,
      kind: id.startsWith('rx:') ? 'reaction' : 'resource',
      x: 60 + rnd() * (W - 120),
      y: 60 + rnd() * (H - 120),
      vx: 0,
      vy: 0,
    }));
    const byId = new Map(nodes.map(n => [n.id, n]));

    const k = 90; // ideal edge length
    for (let iter = 0; iter < 120; iter++) {
      // repulsion
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const na = nodes[a];
          const nb = nodes[b];
          let dx = na.x - nb.x;
          let dy = na.y - nb.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const force = (k * k) / dist / 8;
          dx /= dist;
          dy /= dist;
          na.vx += dx * force;
          na.vy += dy * force;
          nb.vx -= dx * force;
          nb.vy -= dy * force;
        }
      }
      // attraction along edges
      for (const e of edges) {
        const na = byId.get(e.from);
        const nb = byId.get(e.to);
        if (!na || !nb) continue;
        let dx = nb.x - na.x;
        let dy = nb.y - na.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (dist - k) / 18;
        dx /= dist;
        dy /= dist;
        na.vx += dx * force;
        na.vy += dy * force;
        nb.vx -= dx * force;
        nb.vy -= dy * force;
      }
      // integrate + damping + bounds
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x = Math.max(24, Math.min(W - 24, n.x));
        n.y = Math.max(24, Math.min(H - 24, n.y));
      }
    }

    const pos: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) pos[n.id] = { x: n.x, y: n.y };
    setPositions(pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey]);

  // Color logic per resource
  const finalSet = result?.organization ?? [];
  const closedSet = result?.closedSet ?? [];
  const resourceColor = (r: string): { fill: string; stroke: string; strike: boolean; text: string } => {
    if (!result) return { fill: '#FFFDF8', stroke: '#9A3412', strike: false, text: '#2A1810' };
    if (startSet.includes(r)) return { fill: '#9A3412', stroke: '#9A3412', strike: false, text: '#FFFFFF' };
    // removed in self-maintenance: in closedSet but not in final
    if (closedSet.includes(r) && !finalSet.includes(r)) {
      return { fill: '#FFFFFF', stroke: '#BE123C', strike: true, text: '#BE123C' };
    }
    // added by closure
    if (closedSet.includes(r) && !startSet.includes(r)) {
      return { fill: '#B45309', stroke: '#B45309', strike: false, text: '#FFFFFF' };
    }
    if (finalSet.includes(r)) return { fill: '#9A3412', stroke: '#9A3412', strike: false, text: '#FFFFFF' };
    return { fill: '#FFFDF8', stroke: '#D4C4B0', strike: false, text: '#2A1810' };
  };

  // helper: shorten a line so it stops before the target node (for arrowheads)
  const shorten = (ax: number, ay: number, bx: number, by: number, pad: number) => {
    const dx = bx - ax;
    const dy = by - ay;
    const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
    return { x: bx - (dx / d) * pad, y: by - (dy / d) * pad };
  };

  // collect unique reaction colors needed for markers
  const markerColors = Array.from(new Set(network.reactions.map((_, i) => reactionColor(i)).concat(['#B7A48C'])));
  const colorKey = (c: string) => c.replace('#', '');

  // env anchor for inflow/outflow reactions (top-left corner of canvas)
  const envPos = { x: 30, y: 30 };
  const hasFlow = network.reactions.some(rx => rx.inputs.length === 0 || rx.outputs.length === 0);

  return (
    <div className="overflow-auto rounded border border-[#D4C4B0] bg-[#FFFDF8]" style={{ minHeight: 400 }}>
      <svg width={W} height={H} className="block" style={{ minWidth: W }}>
        <defs>
          {markerColors.map(c => (
            <marker
              key={`arr-${colorKey(c)}`}
              id={`arrow-${colorKey(c)}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
            </marker>
          ))}
        </defs>

        {/* edges */}
        {edges.map((e, i) => {
          const a = positions[e.from]; // reaction
          const b = positions[e.to]; // resource
          if (!a || !b) return null;
          const idx = reactionIndex.get(e.rxId) ?? 0;
          const col = result ? reactionColor(idx) : '#B7A48C';
          const mk = `url(#arrow-${colorKey(col)})`;
          if (e.type === 'in') {
            // input: solid line, arrow pointing INTO the reaction node (resource -> reaction)
            const end = shorten(b.x, b.y, a.x, a.y, 11);
            return (
              <line
                key={i}
                x1={b.x}
                y1={b.y}
                x2={end.x}
                y2={end.y}
                stroke={col}
                strokeOpacity={0.85}
                strokeWidth={1.5}
                markerEnd={mk}
              />
            );
          }
          // output: dashed line, arrow pointing OUT of reaction node (reaction -> resource)
          const end = shorten(a.x, a.y, b.x, b.y, 11);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={end.x}
              y2={end.y}
              stroke={col}
              strokeOpacity={0.85}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              markerEnd={mk}
            />
          );
        })}

        {/* env connections for inflow/outflow reactions */}
        {network.reactions.map(rx => {
          const isInflow = rx.inputs.length === 0;
          const isOutflow = rx.outputs.length === 0;
          if (!isInflow && !isOutflow) return null;
          const p = positions[`rx:${rx.id}`];
          if (!p) return null;
          const idx = reactionIndex.get(rx.id) ?? 0;
          const col = result ? reactionColor(idx) : '#B7A48C';
          const mk = `url(#arrow-${colorKey(col)})`;
          if (isInflow) {
            // env -> reaction (solid, into reaction)
            const end = shorten(envPos.x, envPos.y, p.x, p.y, 11);
            return (
              <line key={`env-${rx.id}`} x1={envPos.x} y1={envPos.y} x2={end.x} y2={end.y}
                stroke={col} strokeOpacity={0.85} strokeWidth={1.5} markerEnd={mk} />
            );
          }
          // outflow: reaction -> env (dashed, out of reaction)
          const end = shorten(p.x, p.y, envPos.x, envPos.y, 13);
          return (
            <line key={`env-${rx.id}`} x1={p.x} y1={p.y} x2={end.x} y2={end.y}
              stroke={col} strokeOpacity={0.85} strokeWidth={1.5} strokeDasharray="4 3" markerEnd={mk} />
          );
        })}

        {/* env node (only if any inflow/outflow exists) */}
        {hasFlow && (
          <g>
            <circle cx={envPos.x} cy={envPos.y} r={11} fill="#FFFDF8" stroke="#9A3412" strokeWidth={1.5} strokeDasharray="3 2" />
            <text x={envPos.x} y={envPos.y + 4} textAnchor="middle" fontSize={11} fill="#9A3412" fontWeight="bold">∅</text>
            <text x={envPos.x} y={envPos.y + 24} textAnchor="middle" fontSize={9} fill="#9A3412">env</text>
          </g>
        )}

        {/* reaction nodes */}
        {network.reactions.map((rx, i) => {
          const p = positions[`rx:${rx.id}`];
          if (!p) return null;
          const col = result ? reactionColor(i) : '#8a7a64';
          return (
            <g key={rx.id}>
              <rect
                x={p.x - 7}
                y={p.y - 7}
                width={14}
                height={14}
                fill={col}
                rx={2}
              />
              <text x={p.x} y={p.y - 11} textAnchor="middle" className="font-mono" fontSize={10} fill={col}>
                {rx.id}
              </text>
            </g>
          );
        })}

        {/* resource nodes */}
        {network.resources.map(r => {
          const p = positions[`res:${r}`];
          if (!p) return null;
          const c = resourceColor(r);
          return (
            <g key={r}>
              <circle
                cx={p.x}
                cy={p.y}
                r={9}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={c.strike ? 2 : 1}
              />
              {c.strike && (
                <line x1={p.x - 11} y1={p.y} x2={p.x + 11} y2={p.y} stroke="#BE123C" strokeWidth={2} />
              )}
              <text
                x={p.x}
                y={p.y + 20}
                textAnchor="middle"
                className="font-mono"
                fontSize={10}
                fill={c.text === '#FFFFFF' ? c.stroke : c.text}
              >
                {r}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live organization preview (both checks on the current start set)
// ---------------------------------------------------------------------------

function LiveCheck({ network, startSet }: { network: ReactionNetwork; startSet: ResourceId[] }) {
  if (startSet.length === 0) return null;
  const preview = computeOrganization(network, startSet);

  return (
    <div className="bg-[#FFFDF8] rounded border border-[#D4C4B0] p-3 space-y-2">
      <div className="text-[#9A3412] text-xs font-bold uppercase tracking-wider">Live-Check</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`rounded p-2 border bg-white ${preview.isClosed ? 'border-[#15803D] text-[#15803D]' : 'border-[#BE123C] text-[#BE123C]'}`}>
          {preview.isClosed ? '✓' : '✗'} Abgeschlossen
          {!preview.isClosed && (
            <div className="text-[#2A1810] mt-1 text-[10px]">
              {preview.closureViolations.map(v =>
                `${v.reactionId} → ${v.outsideResources.join(', ')} ∉ Set`
              ).join(' | ')}
            </div>
          )}
        </div>
        <div className={`rounded p-2 border bg-white ${preview.isSelfMaintaining ? 'border-[#15803D] text-[#15803D]' : 'border-[#BE123C] text-[#BE123C]'}`}>
          {preview.isSelfMaintaining ? '✓' : '✗'} Selbsterhaltend
          {!preview.isSelfMaintaining && (
            <div className="text-[#2A1810] mt-1 text-[10px]">
              Nicht produziert: {preview.selfMaintViolations.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

const PANEL = 'bg-[#FFFDF8] rounded border border-[#D4C4B0] p-4';
const LABEL = 'text-[#9A3412] text-xs uppercase tracking-wider mb-3 font-bold';

export default function NetworkEditor({ network, startSet, result, onNetworkChange, onStartSetChange, onAnalyze }: Props) {
  const [activePreset, setActivePreset] = useState<string>('ecosystem');
  const [newResource, setNewResource] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [reactionError, setReactionError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [showGraph, setShowGraph] = useState(true);

  const handlePresetChange = (key: string) => {
    setActivePreset(key);
    onNetworkChange(presets[key].network);
    onStartSetChange(presets[key].defaultStart);
  };

  const addResource = () => {
    const r = newResource.trim();
    if (!r || network.resources.includes(r)) return;
    onNetworkChange({ ...network, resources: [...network.resources, r] });
    setNewResource('');
  };

  const removeResource = (r: ResourceId) => {
    onNetworkChange({
      resources: network.resources.filter(x => x !== r),
      reactions: network.reactions.filter(rx => !rx.inputs.includes(r) && !rx.outputs.includes(r)),
    });
    onStartSetChange(startSet.filter(x => x !== r));
  };

  const addReactionFromBuilder = (inputs: string[], outputs: string[]) => {
    const id = `r${network.reactions.length + 1}`;
    const reaction: Reaction = {
      id,
      inputs,
      outputs,
      label: `${inputs.join(' + ')} → ${outputs.join(' + ')}`,
    };
    const allNew = [...inputs, ...outputs].filter(x => !network.resources.includes(x));
    onNetworkChange({
      resources: [...network.resources, ...allNew],
      reactions: [...network.reactions, reaction],
    });
  };

  const addFlow = (kind: 'inflow' | 'outflow', resource: string) => {
    const id = `r${network.reactions.length + 1}`;
    const reaction: Reaction =
      kind === 'inflow'
        ? { id, inputs: [], outputs: [resource], label: `∅ → ${resource} (Inflow)` }
        : { id, inputs: [resource], outputs: [], label: `${resource} → ∅ (Outflow)` };
    const allNew = [resource].filter(x => !network.resources.includes(x));
    onNetworkChange({
      resources: [...network.resources, ...allNew],
      reactions: [...network.reactions, reaction],
    });
  };

  const addReaction = () => {
    setReactionError('');
    const raw = newReaction.trim();
    if (!raw) return;
    const id = `r${network.reactions.length + 1}`;
    const parsed = parseReaction(raw, id);
    if (!parsed) {
      setReactionError('Format: "a + b → c + d" (Pfeil mit → oder ->)');
      return;
    }
    const allNew = [...parsed.inputs, ...parsed.outputs].filter(x => !network.resources.includes(x));
    onNetworkChange({
      resources: [...network.resources, ...allNew],
      reactions: [...network.reactions, parsed],
    });
    setNewReaction('');
  };

  const removeReaction = (id: string) => {
    onNetworkChange({ ...network, reactions: network.reactions.filter(r => r.id !== id) });
  };

  const toggleStart = (r: ResourceId) => {
    if (startSet.includes(r)) {
      onStartSetChange(startSet.filter(x => x !== r));
    } else {
      onStartSetChange([...startSet, r]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset selector */}
      <div className={PANEL}>
        <div className={LABEL}>Beispielnetzwerk</div>
        <div className="flex gap-2 flex-wrap mb-2">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
                activePreset === key
                  ? 'bg-[#9A3412] text-white'
                  : 'border border-[#9A3412] text-[#9A3412] bg-white hover:bg-[#9A3412]/5'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
        {presets[activePreset]?.description && (
          <div className="text-[#2A1810]/80 text-xs border-t border-[#D4C4B0] pt-2">
            {presets[activePreset].description}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resources panel */}
        <div className={PANEL}>
          <div className={LABEL}>
            Ressourcen ({network.resources.length})
          </div>
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
            {network.resources.map(r => (
              <span
                key={r}
                className="flex items-center gap-1 border border-[#9A3412] text-[#2A1810] bg-white text-xs px-2 py-1 rounded"
              >
                {r}
                <button
                  onClick={() => removeResource(r)}
                  className="text-[#9A3412] hover:text-[#BE123C] transition-colors ml-1"
                  title="Entfernen"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newResource}
              onChange={e => setNewResource(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addResource()}
              placeholder="Neue Ressource…"
              className="flex-1 bg-white border border-[#D4C4B0] text-[#2A1810] text-sm rounded px-3 py-1.5 placeholder-[#2A1810]/40 focus:outline-none focus:border-[#9A3412]"
            />
            <button
              onClick={addResource}
              className="px-3 py-1.5 bg-[#9A3412] text-white font-bold text-sm rounded hover:bg-[#7c2a0e] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Reactions panel */}
        <div className={PANEL}>
          <div className={LABEL}>
            Reaktionen ({network.reactions.length})
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {network.reactions.map((r, idx) => {
              const isSource = r.inputs.length === 0;
              const isSink = r.outputs.length === 0;
              const col = reactionColor(idx);
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-white rounded px-3 py-1.5 border"
                  style={{ borderColor: col }}
                >
                  <span className="text-xs font-mono text-[#2A1810] flex items-center gap-1.5">
                    <span className="font-bold" style={{ color: col }}>{r.id}</span>
                    {reactionToString(r)}
                    {isSource && <span className="text-[#9A3412] text-[10px] border border-[#9A3412] bg-white px-1 rounded">QUELLE</span>}
                    {isSink && <span className="text-[#9A3412] text-[10px] border border-[#9A3412] bg-white px-1 rounded">SENKE</span>}
                  </span>
                  <button
                    onClick={() => removeReaction(r.id)}
                    className="text-[#9A3412] hover:text-[#BE123C] ml-2 text-sm transition-colors"
                    title="Entfernen"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drag & drop reaction builder */}
      <div className={PANEL}>
        <div className={LABEL}>
          Reaktions-Baukasten
        </div>
        <ReactionBuilder resources={network.resources} onAddReaction={addReactionFromBuilder} />

        <FlowBuilder resources={network.resources} onAddFlow={addFlow} />

        <button
          onClick={() => setShowManual(s => !s)}
          className="mt-3 text-[#9A3412] bg-white hover:bg-[#9A3412]/5 border border-[#9A3412] px-2 py-1 rounded text-xs font-bold transition-colors"
        >
          {showManual ? '▲ manuelle Eingabe ausblenden' : '▼ oder manuell eingeben'}
        </button>

        {showManual && (
          <div className="space-y-1.5 mt-3">
            <input
              type="text"
              value={newReaction}
              onChange={e => setNewReaction(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addReaction()}
              placeholder="a + b → c + d"
              className="w-full bg-white border border-[#D4C4B0] text-[#2A1810] text-sm font-mono rounded px-3 py-1.5 placeholder-[#2A1810]/40 focus:outline-none focus:border-[#9A3412]"
            />
            {reactionError && <p className="text-[#BE123C] text-xs">{reactionError}</p>}
            <button
              onClick={addReaction}
              className="w-full px-3 py-1.5 border border-[#9A3412] text-[#9A3412] bg-white hover:bg-[#9A3412] hover:text-white text-sm font-bold rounded transition-colors"
            >
              Reaktion hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Start set selector */}
      <div className={PANEL}>
        <div className="text-[#9A3412] text-xs uppercase tracking-wider mb-1 font-bold">
          Startmenge wählen
        </div>
        <p className="text-[#2A1810]/80 text-xs mb-3">
          Klicke auf Ressourcen, um sie in die Startmenge aufzunehmen oder zu entfernen.
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {network.resources.map(r => (
            <button
              key={r}
              onClick={() => toggleStart(r)}
              className={`text-sm px-3 py-1.5 rounded border font-bold transition-colors ${
                startSet.includes(r)
                  ? 'bg-[#9A3412] text-white border-[#9A3412]'
                  : 'bg-white text-[#2A1810]/70 border-[#D4C4B0] hover:border-[#9A3412]'
              }`}
            >
              {startSet.includes(r) ? '✓ ' : ''}{r}
            </button>
          ))}
        </div>
        {startSet.length === 0 && (
          <div className="text-[#BE123C] text-xs mt-1">Keine Ressourcen gewählt — Analyse nicht möglich.</div>
        )}
      </div>

      {/* Live check preview */}
      <LiveCheck network={network} startSet={startSet} />

      {/* Network visualization */}
      <div className={PANEL}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[#9A3412] text-xs uppercase tracking-wider font-bold">
            Netzwerk-Visualisierung {result ? '(analysiert)' : '(roh)'}
          </div>
          <button
            onClick={() => setShowGraph(s => !s)}
            className="border border-[#9A3412] text-[#9A3412] bg-white hover:bg-[#9A3412] hover:text-white px-2 py-1 rounded text-xs font-bold transition-colors"
          >
            {showGraph ? 'ausblenden' : 'anzeigen'}
          </button>
        </div>
        {showGraph && <NetworkGraph network={network} startSet={startSet} result={result} />}
        {showGraph && (
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-[#2A1810]">
            {result && <span className="text-[#9A3412]">● Startmenge / Organisation</span>}
            {result && <span className="text-[#B45309]">● durch Closure</span>}
            {result && <span className="text-[#BE123C]">⊘ entfernt</span>}
            <span>— Input (durchgezogen, → in Reaktion)</span>
            <span>· · Output (gestrichelt, aus Reaktion →)</span>
            <span>∅ env = außerhalb des Systems</span>
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={startSet.length === 0 && network.reactions.length === 0}
        className="w-full py-3 bg-[#9A3412] text-white hover:bg-[#7c2a0e] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg rounded transition-colors"
      >
        Analyse starten →
      </button>
    </div>
  );
}
