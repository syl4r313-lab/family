import { useState } from 'react';
import OnboardingScreen from './OnboardingScreen';
import NetworkEditor from './NetworkEditor';
import TraceViewer from './TraceViewer';
import ResultPanel from './ResultPanel';
import { computeOrganization } from './engine';
import type { ReactionNetwork, ResourceId, COTResult } from './engine';
import { presets } from './presets';

const ONBOARDING_KEY = 'cot_onboarding_done';

export default function COTApp() {
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  });

  const [network, setNetwork] = useState<ReactionNetwork>(presets.ecosystem.network);
  const [startSet, setStartSet] = useState<ResourceId[]>(presets.ecosystem.defaultStart);
  const [result, setResult] = useState<COTResult | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'trace' | 'result'>('editor');

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setOnboardingDone(true);
  };

  const handleAnalyze = () => {
    const res = computeOrganization(network, startSet);
    setResult(res);
    setActiveTab('trace');
  };

  if (!onboardingDone) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black text-[#c0c0c0] font-mono">
      {/* Top bar */}
      <header className="border-b border-[#00ff41]/30 px-4 py-3 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur z-10">
        <div>
          <div className="text-lg font-bold text-[#00ff41] leading-none" style={{ textShadow: '0 0 6px #00ff41' }}>
            &gt; COT_EXPLORER
          </div>
          <div className="text-[#00ff41]/50 text-xs">Chemical Organization Theory</div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(ONBOARDING_KEY);
            setOnboardingDone(false);
          }}
          className="border border-[#ff0080] text-[#ff0080] hover:bg-[#ff008020] text-xs px-2 py-1 rounded transition-colors"
          title="Einführung erneut anzeigen"
        >
          ? HILFE
        </button>
      </header>

      {/* Tabs */}
      <nav className="border-b border-[#00ff41]/30 px-4">
        <div className="flex gap-1 -mb-px">
          {[
            { key: 'editor', label: 'NETZWERK' },
            { key: 'trace', label: 'PROTOKOLL', disabled: !result },
            { key: 'result', label: 'ERGEBNIS', disabled: !result },
          ].map(({ key, label, disabled }) => (
            <button
              key={key}
              disabled={disabled}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                activeTab === key
                  ? 'border-[#00ff41] text-[#00ff41]'
                  : 'border-transparent text-[#00ff41]/40 hover:text-[#00ff41]'
              }`}
              style={activeTab === key ? { textShadow: '0 0 6px #00ff41' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'editor' && (
          <NetworkEditor
            network={network}
            startSet={startSet}
            result={result}
            onNetworkChange={setNetwork}
            onStartSetChange={setStartSet}
            onAnalyze={handleAnalyze}
          />
        )}

        {activeTab === 'trace' && result && (
          <div className="space-y-4">
            <TraceViewer
              trace={result.trace}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('result')}
                className="flex-1 py-2 bg-[#00ff41] text-black font-bold text-sm rounded hover:bg-[#00cc33] transition-colors"
              >
                ZUM ERGEBNIS →
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2 border border-[#ff0080] text-[#ff0080] hover:bg-[#ff008020] text-sm rounded transition-colors"
              >
                ← EDITOR
              </button>
            </div>
          </div>
        )}

        {activeTab === 'result' && result && (
          <div className="space-y-4">
            <ResultPanel result={result} />
            <button
              onClick={() => setActiveTab('editor')}
              className="w-full py-2 border border-[#ff0080] text-[#ff0080] hover:bg-[#ff008020] text-sm rounded transition-colors"
            >
              ← ZURÜCK ZUM EDITOR
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
