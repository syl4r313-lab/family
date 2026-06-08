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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top bar */}
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <div>
          <div className="text-lg font-bold text-white leading-none">COT Explorer</div>
          <div className="text-slate-500 text-xs">Chemical Organization Theory</div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(ONBOARDING_KEY);
            setOnboardingDone(false);
          }}
          className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
          title="Einführung erneut anzeigen"
        >
          ? Hilfe
        </button>
      </header>

      {/* Tabs */}
      <nav className="border-b border-slate-800 px-4">
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
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                activeTab === key
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-white'
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
            onNetworkChange={setNetwork}
            onStartSetChange={setStartSet}
            onAnalyze={handleAnalyze}
          />
        )}

        {activeTab === 'trace' && result && (
          <div className="space-y-4">
            <TraceViewer
              trace={result.trace}
              closedSet={result.closedSet}
              finalSet={result.organization ?? []}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('result')}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Zum Ergebnis →
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-xl transition-colors"
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
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-xl transition-colors"
            >
              ← Zurück zum Editor
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
