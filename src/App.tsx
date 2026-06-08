import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Members from './pages/Members';
import Goals from './pages/Goals';
import Shop from './pages/Shop';
import Onboarding from './pages/Onboarding';
import { useFamilyStore } from './store/useFamilyStore';
import COTApp from './cot/COTApp';

export type Page = 'dashboard' | 'quests' | 'members' | 'goals' | 'shop';
type AppMode = 'landing' | 'family' | 'cot';

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.99 },
};

const pageTransition = {
  duration: 0.22,
  ease: 'easeInOut',
};

function LandingPage({ onSelect }: { onSelect: (mode: AppMode) => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <div className="text-4xl font-bold text-white mb-2">Willkommen</div>
        <div className="text-slate-400 text-sm">Wähle eine App</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        <button
          onClick={() => onSelect('family')}
          className="group bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 rounded-2xl p-6 text-left transition-all shadow-xl hover:shadow-violet-900/40 hover:-translate-y-0.5"
        >
          <div className="text-3xl mb-3">🏠</div>
          <div className="text-white font-bold text-lg mb-1">Family Quest</div>
          <div className="text-violet-200 text-sm leading-relaxed">
            Quests, Ziele und Belohnungen für die Familie
          </div>
        </button>
        <button
          onClick={() => onSelect('cot')}
          className="group bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-600 hover:border-sky-600 rounded-2xl p-6 text-left transition-all shadow-xl hover:-translate-y-0.5"
        >
          <div className="text-3xl mb-3">⚗️</div>
          <div className="text-white font-bold text-lg mb-1">COT Explorer</div>
          <div className="text-slate-300 text-sm leading-relaxed">
            Chemical Organization Theory interaktiv erkunden
          </div>
        </button>
      </div>
    </div>
  );
}

function App() {
  const isOnboarded = useFamilyStore((s) => s.isOnboarded);
  const [appMode, setAppMode] = useState<AppMode>('landing');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (appMode === 'landing') {
    return <LandingPage onSelect={setAppMode} />;
  }

  if (appMode === 'cot') {
    return (
      <div>
        <COTApp />
        <div className="fixed bottom-4 left-4">
          <button
            onClick={() => setAppMode('landing')}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800"
          >
            ← Startseite
          </button>
        </div>
      </div>
    );
  }

  // Family app
  if (!isOnboarded) {
    return (
      <div>
        <Onboarding />
        <div className="fixed bottom-4 left-4">
          <button
            onClick={() => setAppMode('landing')}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors bg-white/10 px-2 py-1 rounded-lg"
          >
            ← Startseite
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'quests': return <Quests />;
      case 'members': return <Members />;
      case 'goals': return <Goals />;
      case 'shop': return <Shop />;
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="flex-1"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </Layout>
  );
}

export default App;
