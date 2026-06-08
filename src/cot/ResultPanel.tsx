import type { COTResult } from './engine';

interface Props {
  result: COTResult;
}

export default function ResultPanel({ result }: Props) {
  const { startSet, closedSet, organization, isOrganization, isExactOrganization, trace } = result;

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
            ? isExactOrganization ? 'border-[#00ff41] bg-[#0a0a0a]' : 'border-[#ffff00] bg-[#0a0a0a]'
            : 'border-[#ff0080] bg-[#0a0a0a]'
        }`}
      >
        <div className="text-4xl mb-3">{isOrganization ? (isExactOrganization ? '✓' : '~') : '✗'}</div>
        <div className={`text-xl font-bold mb-2 ${isOrganization ? (isExactOrganization ? 'text-[#00ff41]' : 'text-[#ffff00]') : 'text-[#ff0080]'}`}>
          {isOrganization
            ? isExactOrganization
              ? 'Eingabe ist eine Organisation'
              : 'Reduzierte Teilmenge ist eine Organisation'
            : 'Keine Organisation gefunden'}
        </div>
        <div className="text-[#c0c0c0] text-sm max-w-sm mx-auto">
          {isOrganization && !isExactOrganization && (
            <p className="text-[#ffff00] mb-2 text-xs">
              Die Startmenge selbst ist <strong>keine</strong> Organisation —
              nach Entfernen nicht-selbsterhaltender Ressourcen bleibt eine Teilmenge übrig.
            </p>
          )}
          Eine Organisation ist eine Ressourcenmenge, die gleichzeitig{' '}
          <span className="text-[#00ff41]">abgeschlossen</span> und{' '}
          <span className="text-[#ffff00]">selbsterhaltend</span> ist.
        </div>
      </div>

      {/* Properties checklist */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#00ff41]/30 p-4 space-y-3">
        <div className="text-[#c0c0c0] text-xs uppercase tracking-wider">Eigenschaften</div>

        <div className="flex items-start gap-3">
          <span className="text-[#00ff41] mt-0.5 text-lg">⊆</span>
          <div>
            <div className="text-[#00ff41] font-medium text-sm">Abgeschlossenheit (Closure)</div>
            <div className="text-[#c0c0c0] text-xs mt-0.5">
              Alle möglichen Reaktionen innerhalb der Menge erzeugen keine neuen Ressourcen außerhalb.
            </div>
            <div className={`text-xs mt-1 font-semibold ${isOrganization ? 'text-[#00ff41]' : 'text-[#c0c0c0]'}`}>
              {isOrganization ? '✓ Erfüllt' : '— wird nach Selbsterhaltungsreduktion geprüft'}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#00ff41]/20" />

        <div className="flex items-start gap-3">
          <span className="text-[#ffff00] mt-0.5 text-lg">↺</span>
          <div>
            <div className="text-[#00ff41] font-medium text-sm">Selbsterhaltung (Self-Maintenance)</div>
            <div className="text-[#c0c0c0] text-xs mt-0.5">
              Jede verbrauchte Ressource wird auch von einer Reaktion innerhalb der Menge produziert.
            </div>
            {removed.length === 0 ? (
              <div className="text-[#00ff41] text-xs mt-1 font-semibold">✓ Erfüllt — keine Ressourcen mussten entfernt werden</div>
            ) : (
              <div className="text-[#ffff00] text-xs mt-1 font-semibold">
                {removed.length} Ressource(n) verletzten Selbsterhaltung und wurden entfernt
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resource breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* In the organization */}
        <div className="bg-[#0a0a0a] rounded-xl border border-[#00ff41]/30 p-4">
          <div className="text-[#c0c0c0] text-xs uppercase tracking-wider mb-3">
            In der Organisation ({finalSet.length})
          </div>
          {finalSet.length === 0 ? (
            <div className="text-[#00ff41]/50 text-sm">∅ (keine Ressourcen)</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {finalSet.map(r => (
                <span
                  key={r}
                  className="text-xs px-2 py-1 rounded border bg-black text-[#00ff41] border-[#00ff41]"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Removed resources */}
        <div className="bg-[#0a0a0a] rounded-xl border border-[#00ff41]/30 p-4">
          <div className="text-[#c0c0c0] text-xs uppercase tracking-wider mb-3">
            Entfernt ({removed.length})
          </div>
          {removed.length === 0 ? (
            <div className="text-[#00ff41]/50 text-sm">Keine Ressourcen entfernt</div>
          ) : (
            <div className="space-y-2">
              {removed.map(r => (
                <div key={r} className="flex flex-col gap-0.5">
                  <span className="text-xs px-2 py-1 rounded border bg-black text-[#ff0080] border-[#ff0080] inline-flex self-start">
                    {r}
                  </span>
                  {removedReasons[r] && (
                    <span className="text-[#00ff41]/50 text-xs pl-1">{removedReasons[r]}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Closure expansion info */}
      {added.length > 0 && (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#00ff41]/30 p-4">
          <div className="text-[#c0c0c0] text-xs uppercase tracking-wider mb-2">
            Durch Closure hinzugefügt
          </div>
          <p className="text-[#c0c0c0] text-sm mb-2">
            Startend von [{startSet.join(', ')}] wurden durch Reaktionen folgende Ressourcen ergänzt:
          </p>
          <div className="flex flex-wrap gap-2">
            {added.map(r => (
              <span
                key={r}
                className="text-xs px-2 py-1 rounded border bg-black text-[#00ff41] border-[#00ff41]"
              >
                + {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* COT definition box */}
      <div className="bg-[#0a0a0a] border border-[#ff0080]/40 rounded-xl p-4">
        <div className="text-[#ff0080] font-semibold text-sm mb-2">Definition: Organisation (COT)</div>
        <div className="text-[#c0c0c0] text-sm leading-relaxed space-y-1">
          <p>Eine Menge M ⊆ S ist eine <strong>Organisation</strong>, wenn:</p>
          <p className="pl-3 text-[#00ff41]">1. M ist <em>abgeschlossen</em>: cl(M) = M</p>
          <p className="pl-3 text-[#ffff00]">2. M ist <em>selbsterhaltend</em>: Jede in M verbrauchte Ressource wird in M produziert</p>
        </div>
      </div>
    </div>
  );
}
