import { useEffect, useRef, useState } from 'react';
import type { ReactionNetwork, Reaction, ResourceId, COTResult } from './engine';
import { closureOf } from './engine';
import { presets } from './presets';

interface Props {
  network: ReactionNetwork;
  startSet: ResourceId[];
  result: COTResult | null;
  onNetworkChange: (network: ReactionNetwork) => void;
  onStartSetChange: (startSet: ResourceId[]) => void;
  onAnalyze: () => void;
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
      <div className="text-[#00ff41] text-xs font-bold mb-1">{label}</div>
      <div
        onDragOver={e => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        className={`min-h-[64px] rounded p-2 flex flex-wrap gap-1.5 content-start border transition-all ${
          over ? 'border-[#00ff41] bg-[#00ff4110]' : 'border-[#00ff41]/30 bg-black'
        }`}
        style={over ? { boxShadow: '0 0 10px #00ff41' } : undefined}
      >
        {items.length === 0 ? (
          <span className="text-[#00ff41]/40 text-xs italic select-none">
            ziehe Ressourcen hierher…
          </span>
        ) : (
          items.map((r, i) => (
            <span
              key={`${r}-${i}`}
              className="flex items-center gap-1 border border-[#00ff41] text-[#00ff41] bg-black text-xs px-2 py-1 rounded"
            >
              {r}
              <button
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="text-[#ff0080] hover:text-[#ff0080] ml-1"
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
      <div className="text-[#00ff41] text-xs font-bold uppercase tracking-wider">
        RESSOURCEN — in die Zonen ziehen
      </div>
      <div className="flex flex-wrap gap-2">
        {resources.length === 0 && (
          <span className="text-[#00ff41]/40 text-xs italic">keine Ressourcen</span>
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
            className="cursor-grab active:cursor-grabbing border border-[#00ff41] text-[#00ff41] bg-black font-mono text-xs px-2 py-1 rounded select-none"
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
        <div className="font-mono text-[#00ff41] text-sm" style={{ textShadow: '0 0 6px #00ff41' }}>
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
        className="w-full px-3 py-1.5 bg-[#00ff41] text-black font-bold text-sm rounded hover:bg-[#00cc33] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        + ADD REACTION
      </button>
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

  // Build edges: reaction -> input, reaction -> output
  const edges: { from: string; to: string; type: 'in' | 'out' }[] = [];
  for (const rx of network.reactions) {
    for (const i of rx.inputs) edges.push({ from: `rx:${rx.id}`, to: `res:${i}`, type: 'in' });
    for (const o of rx.outputs) edges.push({ from: `rx:${rx.id}`, to: `res:${o}`, type: 'out' });
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
  const resourceColor = (r: string): { fill: string; stroke: string; strike: boolean; glow: boolean } => {
    if (!result) return { fill: '#444444', stroke: '#444444', strike: false, glow: false };
    if (startSet.includes(r)) return { fill: '#00ff41', stroke: '#00ff41', strike: false, glow: true };
    // removed in self-maintenance: in closedSet but not in final
    if (closedSet.includes(r) && !finalSet.includes(r)) {
      return { fill: '#0a0a0a', stroke: '#ff0080', strike: true, glow: false };
    }
    // added by closure
    if (closedSet.includes(r) && !startSet.includes(r)) {
      return { fill: '#ffff00', stroke: '#ffff00', strike: false, glow: false };
    }
    if (finalSet.includes(r)) return { fill: '#00ff41', stroke: '#00ff41', strike: false, glow: true };
    return { fill: '#444444', stroke: '#444444', strike: false, glow: false };
  };

  return (
    <div className="overflow-auto rounded border border-[#00ff41]/30 bg-[#0a0a0a]" style={{ minHeight: 400 }}>
      <svg width={W} height={H} className="block" style={{ minWidth: W }}>
        {/* edges */}
        {edges.map((e, i) => {
          const a = positions[e.from];
          const b = positions[e.to];
          if (!a || !b) return null;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={result ? (e.type === 'in' ? '#00ff41' : '#ff0080') : '#444444'}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          );
        })}

        {/* reaction nodes */}
        {network.reactions.map(rx => {
          const p = positions[`rx:${rx.id}`];
          if (!p) return null;
          return (
            <g key={rx.id}>
              <rect
                x={p.x - 7}
                y={p.y - 7}
                width={14}
                height={14}
                fill={result ? '#ff0080' : '#444444'}
                rx={2}
              />
              <text x={p.x} y={p.y - 11} textAnchor="middle" className="font-mono" fontSize={10} fill="#ff0080">
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
                style={c.glow ? { filter: 'drop-shadow(0 0 6px #00ff41)' } : undefined}
              />
              {c.strike && (
                <line x1={p.x - 11} y1={p.y} x2={p.x + 11} y2={p.y} stroke="#ff0080" strokeWidth={2} />
              )}
              <text
                x={p.x}
                y={p.y + 20}
                textAnchor="middle"
                className="font-mono"
                fontSize={10}
                fill={c.stroke}
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
// Live closure preview
// ---------------------------------------------------------------------------

function ClosurePreview({ network, startSet }: { network: ReactionNetwork; startSet: ResourceId[] }) {
  if (startSet.length === 0) return null;

  const { closedSet } = closureOf(network, startSet);
  const added = closedSet.filter(r => !startSet.includes(r));
  const sourceReactions = network.reactions.filter(r => r.inputs.length === 0);

  // Which reactions caused each added resource?
  const addedBy: Record<string, string[]> = {};
  for (const r of added) {
    const causedBy = network.reactions
      .filter(rx => rx.outputs.includes(r) && rx.inputs.every(inp => closedSet.includes(inp)))
      .map(rx => rx.id);
    addedBy[r] = causedBy;
  }

  return (
    <div className="bg-[#0a0a0a] rounded border border-[#ffff00]/30 p-4 space-y-3">
      <div className="text-[#ffff00] text-xs uppercase tracking-wider font-bold">
        CLOSURE-VORSCHAU — was die Analyse tatsächlich prüft
      </div>

      <div className="text-[#c0c0c0] text-xs leading-relaxed">
        Die Analyse startet mit deiner Startmenge und <span className="text-[#ffff00]">erweitert sie automatisch</span>,
        indem alle anwendbaren Reaktionen feuern (Closure-Schritt). Erst danach wird Selbsterhaltung geprüft.
      </div>

      <div className="space-y-1">
        <div className="text-[#00ff41] text-xs font-bold">Deine Startmenge:</div>
        <div className="flex flex-wrap gap-1.5">
          {startSet.map(r => (
            <span key={r} className="border border-[#00ff41] text-[#00ff41] bg-black text-xs px-2 py-0.5 rounded font-mono">{r}</span>
          ))}
        </div>
      </div>

      {added.length > 0 ? (
        <div className="space-y-1">
          <div className="text-[#ffff00] text-xs font-bold">Durch Closure hinzugefügt ({added.length}):</div>
          <div className="flex flex-wrap gap-1.5">
            {added.map(r => (
              <span key={r} title={`hinzugefügt durch: ${addedBy[r]?.join(', ') ?? '?'}`}
                className="border border-[#ffff00] text-[#ffff00] bg-black text-xs px-2 py-0.5 rounded font-mono cursor-help">
                +{r}
                {addedBy[r]?.length ? <span className="text-[#ffff00]/50 ml-1">({addedBy[r].join(',')})</span> : null}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[#00ff41]/60 text-xs">Keine weiteren Ressourcen durch Closure hinzugefügt.</div>
      )}

      {sourceReactions.length > 0 && (
        <div className="border border-[#ff0080]/40 rounded p-2 text-xs">
          <span className="text-[#ff0080] font-bold">⚠ Quell-Reaktionen (immer aktiv): </span>
          <span className="text-[#c0c0c0]">
            {sourceReactions.map(r => `${r.id} (∅ → ${r.outputs.join(', ')})`).join(', ')}.
            Sie feuern immer, egal was in der Startmenge ist.
          </span>
        </div>
      )}

      <div className="border-t border-[#00ff41]/20 pt-2">
        <div className="text-[#00ff41] text-xs font-bold mb-1">Vollständige Analysemenge ({closedSet.length}):</div>
        <div className="flex flex-wrap gap-1.5">
          {closedSet.map(r => (
            <span key={r} className={`text-xs px-2 py-0.5 rounded font-mono border ${
              startSet.includes(r)
                ? 'border-[#00ff41] text-[#00ff41] bg-black'
                : 'border-[#ffff00] text-[#ffff00] bg-black'
            }`}>{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

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
      <div className="bg-[#0a0a0a] rounded border border-[#00ff41]/30 p-4">
        <div className="text-[#00ff41] text-xs uppercase tracking-wider mb-3 font-bold">BEISPIELNETZWERK</div>
        <div className="flex gap-2 flex-wrap mb-2">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`px-3 py-1.5 rounded text-sm font-mono transition-all ${
                activePreset === key
                  ? 'bg-[#00ff41] text-black font-bold'
                  : 'border border-[#00ff41] text-[#00ff41] bg-black hover:bg-[#00ff4110]'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
        {presets[activePreset]?.description && (
          <div className="text-[#c0c0c0] text-xs border-t border-[#00ff41]/20 pt-2">
            {presets[activePreset].description}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resources panel */}
        <div className="bg-[#0a0a0a] rounded border border-[#00ff41]/30 p-4">
          <div className="text-[#00ff41] text-xs uppercase tracking-wider mb-3 font-bold">
            RESSOURCEN ({network.resources.length})
          </div>
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
            {network.resources.map(r => (
              <span
                key={r}
                className="flex items-center gap-1 border border-[#00ff41] text-[#00ff41] bg-black text-xs px-2 py-1 rounded"
              >
                {r}
                <button
                  onClick={() => removeResource(r)}
                  className="text-[#ff0080] hover:text-[#ff0080] transition-colors ml-1"
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
              className="flex-1 bg-black border border-[#00ff41] text-[#00ff41] font-mono text-sm rounded px-3 py-1.5 placeholder-[#00ff41]/40 focus:outline-none"
            />
            <button
              onClick={addResource}
              className="px-3 py-1.5 bg-[#00ff41] text-black font-bold text-sm rounded hover:bg-[#00cc33] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Reactions panel */}
        <div className="bg-[#0a0a0a] rounded border border-[#00ff41]/30 p-4">
          <div className="text-[#00ff41] text-xs uppercase tracking-wider mb-3 font-bold">
            REAKTIONEN ({network.reactions.length})
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {network.reactions.map(r => {
              const isSource = r.inputs.length === 0;
              const isSink = r.outputs.length === 0;
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between bg-black rounded px-3 py-1.5 border ${
                    isSource ? 'border-[#ff0080]/60' : isSink ? 'border-[#ffff00]/40' : 'border-[#00ff41]/30'
                  }`}
                >
                  <span className="text-xs font-mono text-[#00ff41] flex items-center gap-1.5">
                    <span className="text-[#ff0080]">{r.id}</span>
                    {reactionToString(r)}
                    {isSource && <span className="text-[#ff0080] text-[10px] border border-[#ff0080]/60 px-1 rounded">QUELLE</span>}
                    {isSink && <span className="text-[#ffff00] text-[10px] border border-[#ffff00]/60 px-1 rounded">SENKE</span>}
                  </span>
                  <button
                    onClick={() => removeReaction(r.id)}
                    className="text-[#ff0080] hover:text-[#ff0080] ml-2 text-sm transition-colors"
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
      <div className="bg-[#0a0a0a] rounded border border-[#00ff41]/30 p-4">
        <div className="text-[#00ff41] text-xs uppercase tracking-wider mb-3 font-bold">
          REAKTIONS-BAUKASTEN
        </div>
        <ReactionBuilder resources={network.resources} onAddReaction={addReactionFromBuilder} />

        <button
          onClick={() => setShowManual(s => !s)}
          className="mt-3 text-[#ff0080] hover:bg-[#ff008020] border border-[#ff0080] px-2 py-1 rounded text-xs transition-colors"
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
              className="w-full bg-black border border-[#00ff41] text-[#00ff41] text-sm font-mono rounded px-3 py-1.5 placeholder-[#00ff41]/40 focus:outline-none"
            />
            {reactionError && <p className="text-[#ff0080] text-xs">{reactionError}</p>}
            <button
              onClick={addReaction}
              className="w-full px-3 py-1.5 border border-[#ff0080] text-[#ff0080] hover:bg-[#ff008020] text-sm rounded transition-colors"
            >
              Reaktion hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Start set selector */}
      <div className="bg-[#0a0a0a] rounded border border-[#00ff41]/30 p-4">
        <div className="text-[#00ff41] text-xs uppercase tracking-wider mb-1 font-bold">
          STARTMENGE WÄHLEN
        </div>
        <p className="text-[#c0c0c0] text-xs mb-3">
          Klicke auf Ressourcen, um sie in die Startmenge aufzunehmen oder zu entfernen.
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {network.resources.map(r => (
            <button
              key={r}
              onClick={() => toggleStart(r)}
              className={`text-sm px-3 py-1.5 rounded border font-mono transition-all ${
                startSet.includes(r)
                  ? 'bg-[#00ff41] text-black border-[#00ff41] font-bold'
                  : 'bg-black text-[#00ff41]/60 border-[#00ff41]/30 hover:border-[#00ff41]'
              }`}
              style={startSet.includes(r) ? { boxShadow: '0 0 10px #00ff41' } : undefined}
            >
              {startSet.includes(r) ? '✓ ' : ''}{r}
            </button>
          ))}
        </div>
        {startSet.length === 0 && (
          <div className="text-[#ff0080] text-xs mt-1">Keine Ressourcen gewählt — Analyse nicht möglich.</div>
        )}
      </div>

      {/* Live closure preview */}
      <ClosurePreview network={network} startSet={startSet} />

      {/* Network visualization */}
      <div className="bg-[#0a0a0a] rounded border border-[#00ff41]/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[#00ff41] text-xs uppercase tracking-wider font-bold">
            NETZWERK-VISUALISIERUNG {result ? '(analysiert)' : '(roh)'}
          </div>
          <button
            onClick={() => setShowGraph(s => !s)}
            className="border border-[#ff0080] text-[#ff0080] hover:bg-[#ff008020] px-2 py-1 rounded text-xs transition-colors"
          >
            {showGraph ? 'ausblenden' : 'anzeigen'}
          </button>
        </div>
        {showGraph && <NetworkGraph network={network} startSet={startSet} result={result} />}
        {showGraph && result && (
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-mono">
            <span className="text-[#00ff41]">● Startmenge / Organisation</span>
            <span className="text-[#ffff00]">● durch Closure</span>
            <span className="text-[#ff0080]">⊘ entfernt</span>
            <span className="text-[#444444]">● neutral</span>
            <span className="text-[#ff0080]">■ Reaktion</span>
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={startSet.length === 0 && network.reactions.length === 0}
        className="w-full py-3 bg-[#00ff41] text-black hover:bg-[#00cc33] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-lg rounded transition-all"
        style={{ boxShadow: '0 0 10px #00ff41' }}
      >
        ANALYSE STARTEN →
      </button>
    </div>
  );
}
