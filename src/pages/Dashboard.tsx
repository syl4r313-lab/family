import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy, Zap, Target, TrendingUp, Pencil, Check, X } from 'lucide-react';
import { useFamilyStore, xpForNextLevel } from '../store/useFamilyStore';
import QuestCard from '../components/QuestCard';
import GoalCard from '../components/GoalCard';
import AddQuestModal from '../components/AddQuestModal';
import LevelUpModal from '../components/LevelUpModal';
import Confetti from '../components/Confetti';
import ContributeModal from '../components/ContributeModal';
import type { FamilyGoal } from '../types';

interface CompletionResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  memberName: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { members, quests, goals, familyName, familyXP, familyLevel, setFamilyName } = useFamilyStore();
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(familyName);
  const [contributeGoal, setContributeGoal] = useState<FamilyGoal | null>(null);
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
    ((familyXP - familyCurrentLevelXP) / Math.max(familyNextLevelXP - familyCurrentLevelXP, 1)) * 100
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

  const saveName = () => {
    if (nameInput.trim()) setFamilyName(nameInput.trim());
    setEditingName(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5"
    >
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
      <ContributeModal
        goal={contributeGoal}
        members={members}
        onClose={() => setContributeGoal(null)}
        onSuccess={() => setShowConfetti(true)}
      />

      {/* Family Header */}
      <motion.div variants={itemVariants} className="card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-violet-50 pointer-events-none" />

        <div className="flex items-start justify-between mb-4 relative">
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="input-field text-xl font-black py-1 px-2"
                  autoFocus
                />
                <button onClick={saveName} className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <Check size={13} />
                </button>
                <button onClick={() => { setEditingName(false); setNameInput(familyName); }} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gradient-mint">{familyName}</h1>
                <button
                  onClick={() => { setEditingName(true); setNameInput(familyName); }}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Pencil size={12} className="text-gray-500" />
                </button>
              </div>
            )}
            <p className="text-gray-500 text-sm mt-0.5">Familien-Dashboard</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Trophy size={16} className="text-amber-500" />
              <span className="text-amber-500 font-black text-xl">Lv.{familyLevel}</span>
            </div>
            <div className="text-gray-400 text-xs">{familyXP.toLocaleString()} XP</div>
          </div>
        </div>

        {/* Family XP bar */}
        <div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${familyProgress}%` }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Level {familyLevel}</span>
            <span>Level {familyLevel + 1} bei {familyNextLevelXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
            <div className="text-xl font-black text-violet-600">{members.length}</div>
            <div className="text-gray-500 text-xs">Mitglieder</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <div className="text-xl font-black text-emerald-600">{totalCompleted}</div>
            <div className="text-gray-500 text-xs">Erledigt</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
            <div className="text-xl font-black text-amber-600">{todayCompleted}</div>
            <div className="text-gray-500 text-xs">Heute</div>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      {sortedMembers.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={17} className="text-amber-500" />
            <h2 className="text-base font-bold text-gray-800">Rangliste</h2>
          </div>
          <div className="space-y-2">
            {sortedMembers.map((member, index) => (
              <motion.div
                key={member.id}
                whileHover={{ scale: 1.01 }}
                className="card px-4 py-3 flex items-center gap-3"
              >
                <span className="text-lg w-6 text-center">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                  {member.avatarType === 'photo' ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{member.avatar}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 truncate">{member.name}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                      Lv.{member.level}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (member.xp / Math.max(xpForNextLevel(member.level), 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-amber-500 font-bold text-sm">{member.xp.toLocaleString()}</div>
                  <div className="text-gray-400 text-xs">XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Quests */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={17} className="text-emerald-500" />
            <h2 className="text-base font-bold text-gray-800">Aktive Quests</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddQuest(true)}
            className="flex items-center gap-1.5 text-sm bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full transition-colors font-medium"
          >
            <Plus size={13} />
            Neu
          </motion.button>
        </div>

        {activeQuests.length > 0 ? (
          <div className="space-y-3">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} members={members} onComplete={handleQuestComplete} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-gray-800 font-bold">Alle Quests erledigt!</p>
            <p className="text-gray-500 text-sm mt-1">Super, die Familie ist topfit!</p>
          </div>
        )}
      </motion.div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <Target size={17} className="text-violet-500" />
            <h2 className="text-base font-bold text-gray-800">Familienziele</h2>
          </div>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={() => setContributeGoal(goal)}
              />
            ))}
          </div>
        </motion.div>
      )}

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
    </motion.div>
  );
}
