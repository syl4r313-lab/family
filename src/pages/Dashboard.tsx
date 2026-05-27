import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import { useFamilyStore, xpForNextLevel } from '../store/useFamilyStore';
import MemberCard from '../components/MemberCard';
import QuestCard from '../components/QuestCard';
import GoalCard from '../components/GoalCard';
import AddQuestModal from '../components/AddQuestModal';
import LevelUpModal from '../components/LevelUpModal';
import Confetti from '../components/Confetti';

interface CompletionResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  memberName: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { members, quests, goals, familyName, familyXP, familyLevel } = useFamilyStore();
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    visible: boolean;
    memberName: string;
    memberAvatar: string;
    newLevel: number;
    xpGained: number;
  }>({ visible: false, memberName: '', memberAvatar: '', newLevel: 1, xpGained: 0 });

  const todayStr = new Date().toISOString().split('T')[0];
  const activeQuests = quests.filter((q) => !q.completed).slice(0, 4);
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 2);
  const sortedMembers = [...members].sort((a, b) => b.xp - a.xp);

  const totalCompleted = quests.filter((q) => q.completed).length;
  const todayCompleted = quests.filter(
    (q) => q.completed && q.completedAt?.startsWith(todayStr)
  ).length;

  const familyNextLevelXP = xpForNextLevel(familyLevel);
  const familyCurrentLevelXP = xpForNextLevel(familyLevel - 1);
  const familyProgress = Math.min(
    100,
    ((familyXP - familyCurrentLevelXP) / (familyNextLevelXP - familyCurrentLevelXP)) * 100
  );

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-6"
    >
      {/* Modals & Effects */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AddQuestModal
        visible={showAddQuest}
        members={members}
        onClose={() => setShowAddQuest(false)}
      />
      <LevelUpModal
        visible={levelUpData.visible}
        memberName={levelUpData.memberName}
        memberAvatar={levelUpData.memberAvatar}
        newLevel={levelUpData.newLevel}
        xpGained={levelUpData.xpGained}
        onClose={() => setLevelUpData((d) => ({ ...d, visible: false }))}
      />

      {/* Family Header */}
      <motion.div variants={itemVariants} className="glass-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-pink-600/10 pointer-events-none" />

        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black gradient-text">{familyName}</h1>
            <p className="text-gray-400 text-sm">Familien-Dashboard</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-yellow-400 font-black text-xl">Lv.{familyLevel}</span>
            </div>
            <div className="text-gray-500 text-xs">{familyXP.toLocaleString()} XP gesamt</div>
          </div>
        </div>

        {/* Family XP bar */}
        <div className="mt-3">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${familyProgress}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="absolute inset-0 shimmer" />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Level {familyLevel}</span>
            <span>Level {familyLevel + 1} bei {familyNextLevelXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-purple-400">{members.length}</div>
            <div className="text-gray-500 text-xs">Mitglieder</div>
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-green-400">{totalCompleted}</div>
            <div className="text-gray-500 text-xs">Erledigt</div>
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-blue-400">{todayCompleted}</div>
            <div className="text-gray-500 text-xs">Heute</div>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Rangliste dieser Woche</h2>
        </div>
        <div className="space-y-2">
          {sortedMembers.map((member, index) => (
            <MemberCard key={member.id} member={member} rank={index} compact />
          ))}
        </div>
      </motion.div>

      {/* Today's Quests */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-purple-400" />
            <h2 className="text-lg font-bold text-white">Aktive Quests</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddQuest(true)}
            className="flex items-center gap-1.5 text-sm bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus size={14} />
            Neu
          </motion.button>
        </div>

        {activeQuests.length > 0 ? (
          <div className="space-y-3">
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                members={members}
                onComplete={handleQuestComplete}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-white font-bold">Alle Quests erledigt!</p>
            <p className="text-gray-400 text-sm mt-1">Super, die Familie ist topfit!</p>
          </div>
        )}
      </motion.div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Familienziele</h2>
          </div>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Add FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddQuest(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-glow-purple flex items-center justify-center z-30"
        animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.5)', '0 0 35px rgba(139,92,246,0.8)', '0 0 20px rgba(139,92,246,0.5)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </motion.div>
  );
}
