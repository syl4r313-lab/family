import { useState } from 'react';
import type { ReactionNetwork, Reaction, ResourceId } from './engine';
import { presets } from './presets';

interface Props {
  network: ReactionNetwork;
  startSet: ResourceId[];
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

export default function NetworkEditor({ network, startSet, onNetworkChange, onStartSetChange, onAnalyze }: Props) {
  const [activePreset, setActivePreset] = useState<string>('ecosystem');
  const [newResource, setNewResource] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [reactionError, setReactionError] = useState('');

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
    // Auto-add new resources
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
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">Beispielnetzwerk</div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activePreset === key
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resources panel */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
            Ressourcen ({network.resources.length})
          </div>
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
            {network.resources.map(r => (
              <span
                key={r}
                className="flex items-center gap-1 bg-sky-900/40 text-sky-300 text-xs px-2 py-1 rounded border border-sky-700"
              >
                {r}
                <button
                  onClick={() => removeResource(r)}
                  className="text-sky-500 hover:text-rose-400 transition-colors ml-1"
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
              className="flex-1 bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={addResource}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-sm rounded-lg transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Reactions panel */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
            Reaktionen ({network.reactions.length})
          </div>
          <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto pr-1">
            {network.reactions.map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-slate-700/60 rounded-lg px-3 py-1.5"
              >
                <span className="text-xs font-mono text-amber-300">
                  <span className="text-slate-500 mr-2">{r.id}</span>
                  {reactionToString(r)}
                </span>
                <button
                  onClick={() => removeReaction(r.id)}
                  className="text-slate-500 hover:text-rose-400 ml-2 text-sm transition-colors"
                  title="Entfernen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <input
              type="text"
              value={newReaction}
              onChange={e => setNewReaction(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addReaction()}
              placeholder="a + b → c + d"
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm font-mono rounded-lg px-3 py-1.5 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {reactionError && <p className="text-rose-400 text-xs">{reactionError}</p>}
            <button
              onClick={addReaction}
              className="w-full px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
            >
              Reaktion hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Start set selector */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
          Startmenge wählen
        </div>
        <p className="text-slate-400 text-sm mb-3">
          Wähle die Ressourcen, von denen die Analyse ausgehen soll:
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {network.resources.map(r => (
            <button
              key={r}
              onClick={() => toggleStart(r)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                startSet.includes(r)
                  ? 'bg-emerald-700/60 text-emerald-200 border-emerald-600'
                  : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-slate-500'
              }`}
            >
              {startSet.includes(r) ? '✓ ' : ''}{r}
            </button>
          ))}
        </div>
        {startSet.length > 0 && (
          <div className="text-slate-500 text-xs mt-1">
            Gewählt: {startSet.join(', ')}
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={startSet.length === 0 && network.reactions.length === 0}
        className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg"
      >
        Analyse starten →
      </button>
    </div>
  );
}
