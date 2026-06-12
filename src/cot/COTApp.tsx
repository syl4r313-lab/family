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
    <div
      className="min-h-screen text-[#2A1810] font-sans"
      style={{
        backgroundColor: '#FBF6EC',
        backgroundImage:
          'linear-gradient(#00000010 1px, transparent 1px), linear-gradient(90deg, #00000010 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top bar */}
      <header className="border-b-2 border-[#9A3412] px-4 py-3 flex items-center justify-between sticky top-0 bg-[#FBF6EC]/95 backdrop-blur z-10">
        <div>
          <div className="text-xl font-black text-[#9A3412] leading-none tracking-tight">
            COT Explorer
          </div>
          <div className="text-[#2A1810]/60 text-xs">Chemical Organization Theory</div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(ONBOARDING_KEY);
            setOnboardingDone(false);
          }}
          className="border border-[#9A3412] text-[#9A3412] bg-white hover:bg-[#9A3412] hover:text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
          title="Einführung erneut anzeigen"
        >
          ? Hilfe
        </button>
      </header>

      {/* Tabs */}
      <nav className="border-b border-[#D4C4B0] px-4 bg-[#FBF6EC]/80">
        <div className="flex gap-1 -mb-px">
          {[
            { key: 'editor', label: 'Netzwerk' },
            { key: 'trace', label: 'Protokoll', disabled: !result },
            { key: 'result', label: 'Ergebnis', disabled: !result },
          ].map(({ key, label, disabled }) => (
            <button
              key={key}
              disabled={disabled}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                activeTab === key
                  ? 'border-[#9A3412] text-[#9A3412]'
                  : 'border-transparent text-[#2A1810]/50 hover:text-[#9A3412]'
              }`}
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
                className="flex-1 py-2 bg-[#9A3412] text-white font-bold text-sm rounded hover:bg-[#7c2a0e] transition-colors"
              >
                Zum Ergebnis →
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2 border border-[#9A3412] text-[#9A3412] bg-white hover:bg-[#9A3412] hover:text-white text-sm font-bold rounded transition-colors"
              >
                ← Editor
              </button>
            </div>
          </div>
        )}

        {activeTab === 'result' && result && (
          <div className="space-y-4">
            <ResultPanel result={result} />
            <button
              onClick={() => setActiveTab('editor')}
              className="w-full py-2 border border-[#9A3412] text-[#9A3412] bg-white hover:bg-[#9A3412] hover:text-white text-sm font-bold rounded transition-colors"
            >
              ← Zurück zum Editor
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
