import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, CheckCircle, Clock, Zap } from 'lucide-react';
import { useFamilyStore } from '../store/useFamilyStore';
import QuestCard from '../components/QuestCard';
import AddQuestModal from '../components/AddQuestModal';
import LevelUpModal from '../components/LevelUpModal';
import Confetti from '../components/Confetti';
import type { Category } from '../types';

type FilterType = 'all' | 'active' | 'completed' | Category;

interface CompletionResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  memberName: string;
}

export default function Quests() {
  const { members, quests } = useFamilyStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    visible: boolean;
    memberName: string;
    memberAvatar: string;
    newLevel: number;
    xpGained: number;
  }>({ visible: false, memberName: '', memberAvatar: '', newLevel: 1, xpGained: 0 });

  const filters: { value: FilterType; label: string; emoji: string }[] = [
    { value: 'all', label: 'Alle', emoji: '📋' },
    { value: 'active', label: 'Aktiv', emoji: '⚡' },
    { value: 'completed', label: 'Erledigt', emoji: '✅' },
    { value: 'chores', label: 'Haushalt', emoji: '🧹' },
    { value: 'homework', label: 'Aufgaben', emoji: '📚' },
    { value: 'errands', label: 'Besorgungen', emoji: '🛒' },
    { value: 'fun', label: 'Spaß', emoji: '🎮' },
    { value: 'health', label: 'Gesundheit', emoji: '💪' },
  ];

  const filteredQuests = quests.filter((q) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !q.completed;
    if (filter === 'completed') return q.completed;
    return q.category === filter;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCount = quests.filter((q) => !q.completed).length;
  const completedCount = quests.filter((q) => q.completed).length;
  const totalXPAvailable = quests.filter((q) => !q.completed).reduce((sum, q) => sum + q.xpReward, 0);

  const handleQuestComplete = (result: CompletionResult) => {
    setShowConfetti(true);
    if (result.leveledUp) {
      const member = members.find((m) => m.name === result.memberName);
      setTimeout(() => {
        setLevelUpData({
          visible: true,
          memberName: result.memberName,
          memberAvatar: member?.avatar ?? '⭐',
          newLevel: result.newLevel,
          xpGained: result.xpGained,
        });
      }, 1200);
    }
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AddQuestModal visible={showAddQuest} members={members} onClose={() => setShowAddQuest(false)} />
      <LevelUpModal
        visible={levelUpData.visible}
        memberName={levelUpData.memberName}
        memberAvatar={levelUpData.memberAvatar}
        newLevel={levelUpData.newLevel}
        xpGained={levelUpData.xpGained}
        onClose={() => setLevelUpData((d) => ({ ...d, visible: false }))}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Quests</h1>
            <p className="text-gray-500 text-sm">Alle Familienaufgaben</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddQuest(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Neue Quest
          </motion.button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="card p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
              <Clock size={14} />
              <span className="font-black text-lg">{activeCount}</span>
            </div>
            <div className="text-gray-500 text-xs">Offen</div>
          </div>
          <div className="card p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
              <CheckCircle size={14} />
              <span className="font-black text-lg">{completedCount}</span>
            </div>
            <div className="text-gray-500 text-xs">Erledigt</div>
          </div>
          <div className="card p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
              <Zap size={14} />
              <span className="font-black text-lg">{totalXPAvailable}</span>
            </div>
            <div className="text-gray-500 text-xs">XP verfügbar</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Filter size={13} className="text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Filter</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === f.value
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Quest list */}
      <AnimatePresence mode="popLayout">
        {filteredQuests.length > 0 ? (
          <div className="space-y-3">
            {filteredQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} members={members} onComplete={handleQuestComplete} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-10 text-center"
          >
            <div className="text-5xl mb-3">🎯</div>
            <p className="text-gray-800 font-bold text-lg">Keine Quests gefunden</p>
            <p className="text-gray-500 text-sm mt-1">
              {filter === 'completed' ? 'Noch nichts erledigt.' : 'Erstelle eine neue Quest!'}
            </p>
            {filter !== 'completed' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddQuest(true)}
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Quest erstellen
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddQuest(true)}
        className="fixed bottom-24 right-4 w-14 h-14 btn-primary rounded-full shadow-lg flex items-center justify-center z-30"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
