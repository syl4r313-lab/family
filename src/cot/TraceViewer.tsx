import { useState } from 'react';
import type { TraceStep, ResourceId } from './engine';

interface Props {
  trace: TraceStep[];
  closedSet: ResourceId[];
  finalSet: ResourceId[];
}

function stepColor(step: TraceStep): string {
  switch (step.type) {
    case 'closure_start':
    case 'reaction_fires':
    case 'reaction_skipped':
    case 'closure_reached':
      return 'border-[#00ff41]/40 bg-[#0a0a0a]';
    case 'selfmaint_start':
    case 'resource_not_produced':
    case 'resource_removed':
    case 'reaction_disabled':
    case 'selfmaint_reached':
      return 'border-[#ffff00]/40 bg-[#0a0a0a]';
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
    case 'closure_start': return '🔵';
    case 'reaction_fires': return '⚡';
    case 'reaction_skipped': return '⏩';
    case 'closure_reached': return '✅';
    case 'selfmaint_start': return '🔶';
    case 'resource_not_produced': return '⚠️';
    case 'resource_removed': return '🗑️';
    case 'reaction_disabled': return '🚫';

    case 'selfmaint_reached': return '🏁';
    case 'organization_check': return '🔍';
    case 'organization_found': return '🌟';
    case 'not_organization': return '❌';
    default: return '•';
  }
}

function stepTitle(step: TraceStep): string {
  switch (step.type) {
    case 'closure_start': return 'Schließungsberechnung startet';
    case 'reaction_fires': return `Reaktion ${step.reactionId} feuert`;
    case 'reaction_skipped': return `Reaktion ${step.reactionId} feuert nicht`;
    case 'closure_reached': return 'Abschluss erreicht';
    case 'selfmaint_start': return 'Selbsterhaltungsprüfung startet';
    case 'resource_not_produced': return `"${step.resource}" nicht produziert`;
    case 'resource_removed': return `"${step.resource}" entfernt`;
    case 'reaction_disabled': return `Reaktion ${step.reactionId} deaktiviert`;

    case 'selfmaint_reached': return 'Selbsterhaltung stabil';
    case 'organization_check': return 'Organisationsprüfung';
    case 'organization_found': return 'Organisation gefunden!';
    case 'not_organization': return 'Keine Organisation';
    default: return 'Schritt';
  }
}

function ResourceBadge({ r, added, removed }: { r: string; added?: boolean; removed?: boolean }) {
  const cls = added
    ? 'bg-black text-[#00ff41] border-[#00ff41]'
    : removed
    ? 'bg-black text-[#ff0080] border-[#ff0080] line-through'
    : 'bg-black text-[#c0c0c0] border-[#00ff41]/30';
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-mono ${cls}`}>{r}</span>
  );
}

function StepCard({ step, index }: { step: TraceStep; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const renderBody = () => {
    switch (step.type) {
      case 'closure_start':
        return (
          <div>
            <p className="text-[#c0c0c0] text-sm mb-2">Startmenge:</p>
            <div className="flex flex-wrap gap-1">
              {step.currentSet.length === 0
                ? <span className="text-[#00ff41]/50 text-xs">∅ (leer)</span>
                : step.currentSet.map(r => <ResourceBadge key={r} r={r} />)}
            </div>
          </div>
        );
      case 'reaction_fires':
        return (
          <div className="space-y-2">
            <p className="text-[#c0c0c0] text-sm">{step.reason}</p>
            {step.newResources.length > 0 && (
              <div>
                <span className="text-[#c0c0c0] text-xs mr-2">Neu hinzugefügt:</span>
                <div className="inline-flex flex-wrap gap-1">
                  {step.newResources.map(r => <ResourceBadge key={r} r={r} added />)}
                </div>
              </div>
            )}
          </div>
        );
      case 'reaction_skipped':
        return (
          <div>
            <p className="text-[#c0c0c0] text-sm">{step.reason}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {step.missingInputs.map(r => (
                <span key={r} className="text-xs px-2 py-0.5 rounded border bg-black text-[#ff0080] border-[#ff0080]">{r} fehlt</span>
              ))}
            </div>
          </div>
        );
      case 'closure_reached':
        return (
          <div>
            <p className="text-[#c0c0c0] text-sm mb-2">Abgeschlossene Menge ({step.finalSet.length} Ressourcen):</p>
            <div className="flex flex-wrap gap-1">
              {step.finalSet.map(r => <ResourceBadge key={r} r={r} />)}
            </div>
          </div>
        );
      case 'selfmaint_start':
        return (
          <div>
            <p className="text-[#c0c0c0] text-sm mb-2">Prüfe Selbsterhaltung für {step.currentSet.length} Ressourcen:</p>
            <div className="flex flex-wrap gap-1">
              {step.currentSet.map(r => <ResourceBadge key={r} r={r} />)}
            </div>
          </div>
        );
      case 'resource_not_produced':
        return <p className="text-[#ffff00] text-sm">{step.reason}</p>;
      case 'resource_removed':
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ResourceBadge r={step.resource} removed />
              <span className="text-[#c0c0c0] text-xs">wird aus der Menge entfernt</span>
            </div>
            {step.reason && <p className="text-[#00ff41]/50 text-xs">{step.reason}</p>}
          </div>
        );
      case 'reaction_disabled':
        return <p className="text-[#c0c0c0] text-sm">{step.reason}</p>;
      case 'selfmaint_reached':
        return (
          <div>
            <p className="text-[#c0c0c0] text-sm mb-2">Stabile Menge ({step.finalSet.length} Ressourcen):</p>
            <div className="flex flex-wrap gap-1">
              {step.finalSet.length === 0
                ? <span className="text-[#ff0080] text-xs">∅ (leer)</span>
                : step.finalSet.map(r => <ResourceBadge key={r} r={r} />)}
            </div>
          </div>
        );
      case 'organization_check':
        return (
          <div className="space-y-1 text-sm">
            <div className={`flex items-center gap-2 ${step.closedCheck ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}>
              {step.closedCheck ? '✓' : '✗'} Abgeschlossen
            </div>
            <div className={`flex items-center gap-2 ${step.selfMaintCheck ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}>
              {step.selfMaintCheck ? '✓' : '✗'} Selbsterhaltend
            </div>
          </div>
        );
      case 'organization_found':
        return (
          <div>
            <p className="text-[#00ff41] text-sm mb-2">Gefundene Organisation ({step.resources.length} Ressourcen):</p>
            <div className="flex flex-wrap gap-1">
              {step.resources.map(r => (
                <span key={r} className="text-xs px-2 py-0.5 rounded border bg-black text-[#00ff41] border-[#00ff41]">{r}</span>
              ))}
            </div>
          </div>
        );
      case 'not_organization':
        return <p className="text-[#ff0080] text-sm">{step.reason}</p>;
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${stepColor(step)}`}>
      <button
        className="w-full text-left flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-base mt-0.5 shrink-0">{stepIcon(step)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#00ff41] font-medium text-sm">{stepTitle(step)}</span>
            <span className="text-[#00ff41]/50 text-xs shrink-0">#{index + 1}</span>
          </div>
        </div>
        <span className="text-[#00ff41]/50 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="mt-3 pl-8 border-t border-[#00ff41]/20 pt-3">
          {renderBody()}
        </div>
      )}
    </div>
  );
}

export default function TraceViewer({ trace }: Props) {
  const [mode, setMode] = useState<'step' | 'all'>('all');
  const [currentStep, setCurrentStep] = useState(0);

  const visibleSteps = mode === 'all' ? trace : trace.slice(0, currentStep + 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#00ff41] font-semibold text-lg">Berechnungsprotokoll</h2>
        <div className="flex gap-1 bg-[#0a0a0a] border border-[#00ff41]/30 rounded-lg p-1">
          <button
            onClick={() => setMode('all')}
            className={`px-3 py-1 text-xs rounded transition-colors ${mode === 'all' ? 'bg-[#00ff41] text-black text-[#00ff41]' : 'text-[#c0c0c0] hover:text-[#00ff41]'}`}
          >
            Alle Schritte
          </button>
          <button
            onClick={() => { setMode('step'); setCurrentStep(0); }}
            className={`px-3 py-1 text-xs rounded transition-colors ${mode === 'step' ? 'bg-[#00ff41] text-black text-[#00ff41]' : 'text-[#c0c0c0] hover:text-[#00ff41]'}`}
          >
            Schritt für Schritt
          </button>
        </div>
      </div>

      {mode === 'step' && (
        <div className="flex items-center gap-3 mb-4 bg-[#0a0a0a] border border-[#00ff41]/30 rounded-xl p-3">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1 bg-black hover:bg-[#00ff4110] disabled:opacity-30 text-[#00ff41] text-sm rounded-lg transition-colors"
          >
            ← Zurück
          </button>
          <span className="text-[#c0c0c0] text-sm flex-1 text-center">
            Schritt {currentStep + 1} / {trace.length}
          </span>
          <button
            onClick={() => setCurrentStep(s => Math.min(trace.length - 1, s + 1))}
            disabled={currentStep === trace.length - 1}
            className="px-3 py-1 bg-black hover:bg-[#00ff4110] disabled:opacity-30 text-[#00ff41] text-sm rounded-lg transition-colors"
          >
            Weiter →
          </button>
        </div>
      )}

      <div className="space-y-2">
        {visibleSteps.map((step, i) => (
          <StepCard key={i} step={step} index={i} />
        ))}
      </div>

      {mode === 'step' && currentStep < trace.length - 1 && (
        <button
          onClick={() => setCurrentStep(s => Math.min(trace.length - 1, s + 1))}
          className="mt-3 w-full py-2 border border-dashed border-[#00ff41]/40 text-[#c0c0c0] hover:text-[#00ff41] hover:border-[#00ff41] text-sm rounded-xl transition-colors"
        >
          Nächster Schritt →
        </button>
      )}
    </div>
  );
}
