import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Members from './pages/Members';
import Goals from './pages/Goals';
import Shop from './pages/Shop';

export type Page = 'dashboard' | 'quests' | 'members' | 'goals' | 'shop';

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const pageTransition = {
  duration: 0.25,
  ease: 'easeInOut',
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
