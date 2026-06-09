import type { COTResult } from './engine';

interface Props {
  result: COTResult;
}

function Tag({ text, color }: { text: string; color: 'green' | 'red' | 'yellow' | 'grey' }) {
  const cls = { green: 'border-[#00ff41] text-[#00ff41]', red: 'border-[#ff0080] text-[#ff0080]', yellow: 'border-[#ffff00] text-[#ffff00]', grey: 'border-[#00ff41]/30 text-[#c0c0c0]' }[color];
  return <span className={`text-xs px-2 py-0.5 rounded border font-mono bg-black ${cls}`}>{text}</span>;
}

export default function ResultPanel({ result }: Props) {
  const { startSet, isOrganization, isClosed, isSelfMaintaining, closureViolations, selfMaintViolations } = result;

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className={`rounded-2xl border-2 p-6 text-center ${isOrganization ? 'border-[#00ff41] bg-[#0a0a0a]' : 'border-[#ff0080] bg-[#0a0a0a]'}`}>
        <div className={`text-5xl font-bold mb-2 font-mono ${isOrganization ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}
          style={isOrganization ? { textShadow: '0 0 20px #00ff41' } : undefined}>
          {isOrganization ? '✓' : '✗'}
        </div>
        <div className={`text-xl font-bold mb-1 ${isOrganization ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}>
          {isOrganization ? 'Diese Menge ist eine Organisation' : 'Diese Menge ist keine Organisation'}
        </div>
        <div className="text-[#c0c0c0] text-sm">
          Geprüfte Menge: {startSet.length === 0 ? '∅ (leer)' : startSet.join(', ')}
        </div>
      </div>

      {/* Two checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Closure check */}
        <div className={`rounded-xl border p-4 ${isClosed ? 'border-[#00ff41]/40 bg-[#0a0a0a]' : 'border-[#ff0080]/60 bg-[#0a0a0a]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-bold ${isClosed ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}>{isClosed ? '✓' : '✗'}</span>
            <div className={`text-sm font-bold ${isClosed ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}>Abgeschlossenheit (Closure)</div>
          </div>
          <p className="text-[#c0c0c0] text-xs mb-3">
            Jede anwendbare Reaktion darf nur Ressourcen produzieren, die bereits in der Menge sind.
          </p>
          {isClosed ? (
            <div className="text-[#00ff41] text-xs">Alle anwendbaren Reaktionen bleiben innerhalb der Menge.</div>
          ) : (
            <div className="space-y-2">
              {closureViolations.map(v => (
                <div key={v.reactionId} className="text-xs bg-black border border-[#ff0080]/30 rounded p-2">
                  <span className="text-[#ff0080] font-bold">{v.reactionId}</span>
                  <span className="text-[#c0c0c0]"> produziert außerhalb: </span>
                  <span className="text-[#ff0080]">{v.outsideResources.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Self-maintenance check */}
        <div className={`rounded-xl border p-4 ${isSelfMaintaining ? 'border-[#00ff41]/40 bg-[#0a0a0a]' : 'border-[#ff0080]/60 bg-[#0a0a0a]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-bold ${isSelfMaintaining ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}>{isSelfMaintaining ? '✓' : '✗'}</span>
            <div className={`text-sm font-bold ${isSelfMaintaining ? 'text-[#00ff41]' : 'text-[#ff0080]'}`}>Selbsterhaltung (Self-Maintenance)</div>
          </div>
          <p className="text-[#c0c0c0] text-xs mb-3">
            Jede Ressource, die von einer anwendbaren Reaktion verbraucht wird, muss auch von einer anwendbaren Reaktion produziert werden.
          </p>
          {isSelfMaintaining ? (
            <div className="text-[#00ff41] text-xs">Alle verbrauchten Ressourcen werden auch produziert.</div>
          ) : (
            <div className="space-y-1">
              <div className="text-[#ff0080] text-xs font-bold mb-1">Verbraucht aber nicht produziert:</div>
              <div className="flex flex-wrap gap-1">
                {selfMaintViolations.map(r => <Tag key={r} text={r} color="red" />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The set being checked */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#00ff41]/30 p-4">
        <div className="text-[#c0c0c0] text-xs uppercase tracking-wider mb-2">Geprüfte Menge</div>
        <div className="flex flex-wrap gap-2">
          {startSet.length === 0
            ? <span className="text-[#c0c0c0]/40 text-sm">∅ (leer)</span>
            : startSet.map(r => <Tag key={r} text={r} color={isOrganization ? 'green' : 'grey'} />)}
        </div>
      </div>

      {/* Definition */}
      <div className="bg-[#0a0a0a] border border-[#ff0080]/40 rounded-xl p-4">
        <div className="text-[#ff0080] font-semibold text-sm mb-2">Definition: Organisation (COT)</div>
        <div className="text-[#c0c0c0] text-sm leading-relaxed space-y-1">
          <p>Eine Menge M ist eine <strong>Organisation</strong>, wenn:</p>
          <p className="pl-3 text-[#00ff41]">1. M ist <em>abgeschlossen</em>: alle anwendbaren Reaktionen produzieren nur Ressourcen aus M</p>
          <p className="pl-3 text-[#ffff00]">2. M ist <em>selbsterhaltend</em>: jede verbrauchte Ressource wird in M auch produziert</p>
        </div>
      </div>
    </div>
  );
}
