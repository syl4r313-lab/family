import type { COTResult } from './engine';

interface Props {
  result: COTResult;
}

export default function ResultPanel({ result }: Props) {
  const { startSet, closedSet, organization, isOrganization, trace } = result;

  // Compute which resources were removed (in closedSet but not in organization/final)
  const finalSet = organization ?? [];
  const removed = closedSet.filter(r => !finalSet.includes(r));
  const added = closedSet.filter(r => !startSet.includes(r));

  // Find reasons for removed resources from trace
  const removedReasons: Record<string, string> = {};
  for (const step of trace) {
    if (step.type === 'resource_not_produced') {
      removedReasons[step.resource] = step.reason;
    }
  }

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div
        className={`rounded-2xl border-2 p-6 text-center ${
          isOrganization
            ? 'border-emerald-500 bg-emerald-900/20'
            : 'border-rose-600 bg-rose-900/20'
        }`}
      >
        <div className="text-4xl mb-3">{isOrganization ? '✓' : '✗'}</div>
        <div className={`text-xl font-bold mb-2 ${isOrganization ? 'text-emerald-300' : 'text-rose-300'}`}>
          {isOrganization
            ? 'Diese Menge ist eine Organisation'
            : 'Keine Organisation gefunden'}
        </div>
        <div className="text-slate-400 text-sm max-w-sm mx-auto">
          Eine Organisation ist eine Ressourcenmenge, die gleichzeitig{' '}
          <span className="text-sky-400">abgeschlossen</span> und{' '}
          <span className="text-amber-400">selbsterhaltend</span> ist.
        </div>
      </div>

      {/* Properties checklist */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
        <div className="text-slate-400 text-xs uppercase tracking-wider">Eigenschaften</div>

        <div className="flex items-start gap-3">
          <span className="text-sky-400 mt-0.5 text-lg">⊆</span>
          <div>
            <div className="text-white font-medium text-sm">Abgeschlossenheit (Closure)</div>
            <div className="text-slate-400 text-xs mt-0.5">
              Alle möglichen Reaktionen innerhalb der Menge erzeugen keine neuen Ressourcen außerhalb.
            </div>
            <div className={`text-xs mt-1 font-semibold ${isOrganization ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isOrganization ? '✓ Erfüllt' : '— wird nach Selbsterhaltungsreduktion geprüft'}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-700" />

        <div className="flex items-start gap-3">
          <span className="text-amber-400 mt-0.5 text-lg">↺</span>
          <div>
            <div className="text-white font-medium text-sm">Selbsterhaltung (Self-Maintenance)</div>
            <div className="text-slate-400 text-xs mt-0.5">
              Jede verbrauchte Ressource wird auch von einer Reaktion innerhalb der Menge produziert.
            </div>
            {removed.length === 0 ? (
              <div className="text-emerald-400 text-xs mt-1 font-semibold">✓ Erfüllt — keine Ressourcen mussten entfernt werden</div>
            ) : (
              <div className="text-amber-400 text-xs mt-1 font-semibold">
                {removed.length} Ressource(n) verletzten Selbsterhaltung und wurden entfernt
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resource breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* In the organization */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
            In der Organisation ({finalSet.length})
          </div>
          {finalSet.length === 0 ? (
            <div className="text-slate-500 text-sm">∅ (keine Ressourcen)</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {finalSet.map(r => (
                <span
                  key={r}
                  className="text-xs px-2 py-1 rounded border bg-emerald-800/40 text-emerald-300 border-emerald-700"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Removed resources */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
            Entfernt ({removed.length})
          </div>
          {removed.length === 0 ? (
            <div className="text-slate-500 text-sm">Keine Ressourcen entfernt</div>
          ) : (
            <div className="space-y-2">
              {removed.map(r => (
                <div key={r} className="flex flex-col gap-0.5">
                  <span className="text-xs px-2 py-1 rounded border bg-rose-900/30 text-rose-300 border-rose-700 inline-flex self-start">
                    {r}
                  </span>
                  {removedReasons[r] && (
                    <span className="text-slate-500 text-xs pl-1">{removedReasons[r]}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Closure expansion info */}
      {added.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
            Durch Closure hinzugefügt
          </div>
          <p className="text-slate-400 text-sm mb-2">
            Startend von [{startSet.join(', ')}] wurden durch Reaktionen folgende Ressourcen ergänzt:
          </p>
          <div className="flex flex-wrap gap-2">
            {added.map(r => (
              <span
                key={r}
                className="text-xs px-2 py-1 rounded border bg-sky-900/30 text-sky-300 border-sky-700"
              >
                + {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* COT definition box */}
      <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-4">
        <div className="text-indigo-300 font-semibold text-sm mb-2">Definition: Organisation (COT)</div>
        <div className="text-slate-300 text-sm leading-relaxed space-y-1">
          <p>Eine Menge M ⊆ S ist eine <strong>Organisation</strong>, wenn:</p>
          <p className="pl-3 text-sky-300">1. M ist <em>abgeschlossen</em>: cl(M) = M</p>
          <p className="pl-3 text-amber-300">2. M ist <em>selbsterhaltend</em>: Jede in M verbrauchte Ressource wird in M produziert</p>
        </div>
      </div>
    </div>
  );
}
