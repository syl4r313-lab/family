import type { COTResult } from './engine';

interface Props {
  result: COTResult;
}

function Tag({ text, color }: { text: string; color: 'green' | 'red' | 'yellow' | 'grey' }) {
  const cls = { green: 'border-[#15803D] text-[#15803D]', red: 'border-[#BE123C] text-[#BE123C]', yellow: 'border-[#B45309] text-[#B45309]', grey: 'border-[#15803D]/30 text-[#2A1810]' }[color];
  return <span className={`text-xs px-2 py-0.5 rounded border font-mono bg-white ${cls}`}>{text}</span>;
}

export default function ResultPanel({ result }: Props) {
  const { startSet, isOrganization, isClosed, isSelfMaintaining, closureViolations, selfMaintViolations } = result;

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className={`rounded-2xl border-2 p-6 text-center ${isOrganization ? 'border-[#15803D] bg-[#FFFDF8]' : 'border-[#BE123C] bg-[#FFFDF8]'}`}>
        <div className={`text-5xl font-black mb-2 ${isOrganization ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>
          {isOrganization ? '✓' : '✗'}
        </div>
        <div className={`text-xl font-bold mb-1 ${isOrganization ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>
          {isOrganization ? 'Diese Menge ist eine Organisation' : 'Diese Menge ist keine Organisation'}
        </div>
        <div className="text-[#2A1810] text-sm">
          Geprüfte Menge: {startSet.length === 0 ? '∅ (leer)' : startSet.join(', ')}
        </div>
      </div>

      {/* Two checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Closure check */}
        <div className={`rounded-xl border p-4 ${isClosed ? 'border-[#15803D]/40 bg-[#FFFDF8]' : 'border-[#BE123C]/60 bg-[#FFFDF8]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-bold ${isClosed ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>{isClosed ? '✓' : '✗'}</span>
            <div className={`text-sm font-bold ${isClosed ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>Abgeschlossenheit (Closure)</div>
          </div>
          <p className="text-[#2A1810] text-xs mb-3">
            Jede anwendbare Reaktion darf nur Ressourcen produzieren, die bereits in der Menge sind.
          </p>
          {isClosed ? (
            <div className="text-[#15803D] text-xs">Alle anwendbaren Reaktionen bleiben innerhalb der Menge.</div>
          ) : (
            <div className="space-y-2">
              {closureViolations.map(v => (
                <div key={v.reactionId} className="text-xs bg-white border border-[#BE123C]/30 rounded p-2">
                  <span className="text-[#BE123C] font-bold">{v.reactionId}</span>
                  <span className="text-[#2A1810]"> produziert außerhalb: </span>
                  <span className="text-[#BE123C]">{v.outsideResources.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Self-maintenance check */}
        <div className={`rounded-xl border p-4 ${isSelfMaintaining ? 'border-[#15803D]/40 bg-[#FFFDF8]' : 'border-[#BE123C]/60 bg-[#FFFDF8]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-bold ${isSelfMaintaining ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>{isSelfMaintaining ? '✓' : '✗'}</span>
            <div className={`text-sm font-bold ${isSelfMaintaining ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>Selbsterhaltung (Self-Maintenance)</div>
          </div>
          <p className="text-[#2A1810] text-xs mb-3">
            Jede Ressource, die von einer anwendbaren Reaktion verbraucht wird, muss auch von einer anwendbaren Reaktion produziert werden.
          </p>
          {isSelfMaintaining ? (
            <div className="text-[#15803D] text-xs">Alle verbrauchten Ressourcen werden auch produziert.</div>
          ) : (
            <div className="space-y-1">
              <div className="text-[#BE123C] text-xs font-bold mb-1">Verbraucht aber nicht produziert:</div>
              <div className="flex flex-wrap gap-1">
                {selfMaintViolations.map(r => <Tag key={r} text={r} color="red" />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The set being checked */}
      <div className="bg-[#FFFDF8] rounded-xl border border-[#D4C4B0] p-4">
        <div className="text-[#9A3412] text-xs uppercase tracking-wider mb-2 font-bold">Geprüfte Menge</div>
        <div className="flex flex-wrap gap-2">
          {startSet.length === 0
            ? <span className="text-[#2A1810]/40 text-sm">∅ (leer)</span>
            : startSet.map(r => <Tag key={r} text={r} color={isOrganization ? 'green' : 'grey'} />)}
        </div>
      </div>

      {/* Definition */}
      <div className="bg-white border border-[#9A3412] rounded-xl p-4">
        <div className="text-[#9A3412] font-bold text-sm mb-2">Definition: Organisation (COT)</div>
        <div className="text-[#2A1810] text-sm leading-relaxed space-y-1">
          <p>Eine Menge M ist eine <strong>Organisation</strong>, wenn:</p>
          <p className="pl-3 text-[#15803D]">1. M ist <em>abgeschlossen</em>: alle anwendbaren Reaktionen produzieren nur Ressourcen aus M</p>
          <p className="pl-3 text-[#B45309]">2. M ist <em>selbsterhaltend</em>: jede verbrauchte Ressource wird in M auch produziert</p>
        </div>
      </div>
    </div>
  );
}
