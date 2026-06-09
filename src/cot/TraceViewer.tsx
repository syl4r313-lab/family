import { useState } from 'react';
import type { TraceStep } from './engine';

interface Props {
  trace: TraceStep[];
}

function stepColor(step: TraceStep): string {
  switch (step.type) {
    case 'closure_start':
    case 'reaction_fires_inside':
    case 'reaction_not_applicable':
    case 'closure_ok':
      return 'border-[#00ff41]/40 bg-[#0a0a0a]';
    case 'reaction_fires_outside':
    case 'closure_fail':
      return 'border-[#ff0080]/60 bg-[#0a0a0a]';
    case 'selfmaint_start':
    case 'resource_produced_and_consumed':
    case 'resource_only_produced':
    case 'resource_not_consumed':
      return 'border-[#ffff00]/30 bg-[#0a0a0a]';
    case 'resource_not_produced':
    case 'selfmaint_fail':
      return 'border-[#ff0080]/60 bg-[#0a0a0a]';
    case 'selfmaint_ok':
      return 'border-[#00ff41]/40 bg-[#0a0a0a]';
    case 'organization_found':
      return 'border-[#00ff41] bg-[#0a0a0a]';
    case 'not_organization':
      return 'border-[#ff0080] bg-[#0a0a0a]';
    default:
      return 'border-[#00ff41]/20 bg-[#0a0a0a]';
  }
}

function stepIcon(step: TraceStep): string {
  switch (step.type) {
    case 'closure_start': return '▶';
    case 'reaction_fires_inside': return '✓';
    case 'reaction_fires_outside': return '✗';
    case 'reaction_not_applicable': return '—';
    case 'closure_ok': return '✓';
    case 'closure_fail': return '✗';
    case 'selfmaint_start': return '▶';
    case 'resource_produced_and_consumed': return '↺';
    case 'resource_only_produced': return '+';
    case 'resource_not_consumed': return '·';
    case 'resource_not_produced': return '✗';
    case 'selfmaint_ok': return '✓';
    case 'selfmaint_fail': return '✗';
    case 'organization_found': return '★';
    case 'not_organization': return '✗';
    default: return '·';
  }
}

function stepTitle(step: TraceStep): string {
  switch (step.type) {
    case 'closure_start': return 'Abgeschlossenheits-Prüfung startet';
    case 'reaction_fires_inside':
      return `${step.reactionId}${step.label ? ` (${step.label})` : ''} — feuert, alle Outputs im Set ✓`;
    case 'reaction_fires_outside':
      return `${step.reactionId}${step.label ? ` (${step.label})` : ''} — VERSTOSS: Outputs außerhalb ✗`;
    case 'reaction_not_applicable':
      return `${step.reactionId} — nicht anwendbar (Inputs fehlen)`;
    case 'closure_ok': return 'Abgeschlossenheit: ERFÜLLT ✓';
    case 'closure_fail': return 'Abgeschlossenheit: NICHT ERFÜLLT ✗';
    case 'selfmaint_start': return 'Selbsterhaltungs-Prüfung startet';
    case 'resource_produced_and_consumed': return `"${step.resource}" — produziert und verbraucht ✓`;
    case 'resource_only_produced': return `"${step.resource}" — nur produziert (kein Problem)`;
    case 'resource_not_consumed': return `"${step.resource}" — nicht verbraucht (kein Problem)`;
    case 'resource_not_produced': return `"${step.resource}" — VERSTOSS: verbraucht aber nicht produziert ✗`;
    case 'selfmaint_ok': return 'Selbsterhaltung: ERFÜLLT ✓';
    case 'selfmaint_fail': return 'Selbsterhaltung: NICHT ERFÜLLT ✗';
    case 'organization_found': return 'Ergebnis: ORGANISATION ✓';
    case 'not_organization': return 'Ergebnis: KEINE ORGANISATION ✗';
    default: return 'Schritt';
  }
}

function Tag({ text, color }: { text: string; color: 'green' | 'red' | 'yellow' | 'grey' }) {
  const cls = {
    green: 'border-[#00ff41] text-[#00ff41]',
    red: 'border-[#ff0080] text-[#ff0080]',
    yellow: 'border-[#ffff00] text-[#ffff00]',
    grey: 'border-[#00ff41]/30 text-[#c0c0c0]',
  }[color];
  return <span className={`text-xs px-2 py-0.5 rounded border font-mono bg-black ${cls}`}>{text}</span>;
}

function StepBody({ step }: { step: TraceStep }) {
  switch (step.type) {
    case 'closure_start':
      return (
        <div>
          <p className="text-[#c0c0c0] text-xs mb-2">Geprüfte Menge:</p>
          <div className="flex flex-wrap gap-1">
            {step.set.length === 0
              ? <span className="text-[#c0c0c0]/50 text-xs">∅</span>
              : step.set.map(r => <Tag key={r} text={r} color="grey" />)}
          </div>
        </div>
      );
    case 'reaction_fires_outside':
      return (
        <div className="space-y-1">
          <p className="text-[#c0c0c0] text-xs">Diese Reaktion feuert (alle Inputs vorhanden), produziert aber Ressourcen, die <strong className="text-[#ff0080]">nicht</strong> in der Menge sind:</p>
          <div className="flex flex-wrap gap-1">
            {step.outsideResources.map(r => <Tag key={r} text={`+${r} ∉ Set`} color="red" />)}
          </div>
          <p className="text-[#ff0080]/70 text-xs">→ Die Menge ist damit nicht abgeschlossen.</p>
        </div>
      );
    case 'reaction_not_applicable':
      return (
        <div>
          <p className="text-[#c0c0c0] text-xs mb-1">Fehlende Inputs:</p>
          <div className="flex flex-wrap gap-1">
            {step.missingInputs.map(r => <Tag key={r} text={`${r} fehlt`} color="grey" />)}
          </div>
        </div>
      );
    case 'closure_fail':
      return (
        <div className="space-y-1">
          <p className="text-[#ff0080] text-xs font-bold">Verstöße:</p>
          {step.violations.map(v => (
            <div key={v.reactionId} className="text-xs text-[#c0c0c0]">
              <span className="text-[#ff0080]">{v.reactionId}</span> produziert außerhalb: {v.outsideResources.join(', ')}
            </div>
          ))}
        </div>
      );
    case 'selfmaint_start':
      return (
        <div>
          <p className="text-[#c0c0c0] text-xs mb-2">Prüfe für jede Ressource: wird sie verbraucht? Falls ja — wird sie auch produziert?</p>
          <div className="flex flex-wrap gap-1">
            {step.set.map(r => <Tag key={r} text={r} color="grey" />)}
          </div>
        </div>
      );
    case 'resource_produced_and_consumed':
      return (
        <div className="text-xs text-[#c0c0c0] space-y-0.5">
          <div>Verbraucht von: {step.consumedBy.map(id => <span key={id} className="text-[#ff0080] mr-1">{id}</span>)}</div>
          <div>Produziert von: {step.producedBy.map(id => <span key={id} className="text-[#00ff41] mr-1">{id}</span>)} ✓</div>
        </div>
      );
    case 'resource_not_produced':
      return (
        <div className="text-xs space-y-0.5">
          <div className="text-[#c0c0c0]">Verbraucht von: {step.consumedBy.map(id => <span key={id} className="text-[#ff0080] mr-1">{id}</span>)}</div>
          <div className="text-[#ff0080] font-bold">Kein anwendbares Reaktion produziert "{step.resource}" → Selbsterhaltung verletzt!</div>
        </div>
      );
    case 'resource_only_produced':
      return <p className="text-xs text-[#c0c0c0]">Produziert von: {step.producedBy.join(', ')} — kein Verbrauch nötig.</p>;
    case 'selfmaint_fail':
      return (
        <div>
          <p className="text-[#ff0080] text-xs font-bold mb-1">Verletzte Ressourcen:</p>
          <div className="flex flex-wrap gap-1">
            {step.violations.map(r => <Tag key={r} text={r} color="red" />)}
          </div>
        </div>
      );
    case 'organization_found':
      return (
        <div className="flex flex-wrap gap-1">
          {step.resources.map(r => <Tag key={r} text={r} color="green" />)}
        </div>
      );
    case 'not_organization':
      return (
        <div className="text-xs space-y-0.5">
          <div className={step.closedCheck ? 'text-[#00ff41]' : 'text-[#ff0080]'}>
            {step.closedCheck ? '✓' : '✗'} Abgeschlossenheit
          </div>
          <div className={step.selfMaintCheck ? 'text-[#00ff41]' : 'text-[#ff0080]'}>
            {step.selfMaintCheck ? '✓' : '✗'} Selbsterhaltung
          </div>
        </div>
      );
    default:
      return null;
  }
}

function StepCard({ step, index }: { step: TraceStep; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const icon = stepIcon(step);
  const isGreen = ['closure_ok', 'selfmaint_ok', 'organization_found', 'reaction_fires_inside',
    'resource_produced_and_consumed', 'resource_only_produced', 'resource_not_consumed'].includes(step.type);
  const isRed = ['closure_fail', 'selfmaint_fail', 'not_organization',
    'reaction_fires_outside', 'resource_not_produced'].includes(step.type);

  return (
    <div className={`rounded border p-3 transition-all ${stepColor(step)}`}>
      <button className="w-full text-left flex items-center gap-3" onClick={() => setExpanded(e => !e)}>
        <span className={`text-sm font-bold shrink-0 w-4 text-center ${isGreen ? 'text-[#00ff41]' : isRed ? 'text-[#ff0080]' : 'text-[#ffff00]'}`}>
          {icon}
        </span>
        <span className="flex-1 text-xs font-mono text-[#c0c0c0]">{stepTitle(step)}</span>
        <span className="text-[#00ff41]/30 text-xs shrink-0">#{index + 1} {expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="mt-2 pl-7 border-t border-[#00ff41]/10 pt-2">
          <StepBody step={step} />
        </div>
      )}
    </div>
  );
}

export default function TraceViewer({ trace }: Props) {
  const [mode, setMode] = useState<'all' | 'step'>('all');
  const [currentStep, setCurrentStep] = useState(0);
  const visibleSteps = mode === 'all' ? trace : trace.slice(0, currentStep + 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[#00ff41] text-xs font-bold uppercase tracking-wider">PRÜFPROTOKOLL</div>
        <div className="flex gap-1 bg-[#0a0a0a] border border-[#00ff41]/30 rounded p-0.5">
          {(['all', 'step'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setCurrentStep(0); }}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${mode === m ? 'bg-[#00ff41] text-black font-bold' : 'text-[#c0c0c0] hover:text-[#00ff41]'}`}>
              {m === 'all' ? 'Alle' : 'Schritt'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'step' && (
        <div className="flex items-center gap-2 mb-3 bg-[#0a0a0a] border border-[#00ff41]/30 rounded p-2">
          <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}
            className="px-2 py-0.5 text-[#00ff41] text-xs disabled:opacity-30 hover:bg-[#00ff4110] rounded">← Zurück</button>
          <span className="text-[#c0c0c0] text-xs flex-1 text-center">{currentStep + 1} / {trace.length}</span>
          <button onClick={() => setCurrentStep(s => Math.min(trace.length - 1, s + 1))} disabled={currentStep === trace.length - 1}
            className="px-2 py-0.5 text-[#00ff41] text-xs disabled:opacity-30 hover:bg-[#00ff4110] rounded">Weiter →</button>
        </div>
      )}

      <div className="space-y-1.5">
        {visibleSteps.map((step, i) => <StepCard key={i} step={step} index={i} />)}
      </div>
    </div>
  );
}
