import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target, CheckCircle, TrendingUp } from 'lucide-react';
import { useFamilyStore } from '../store/useFamilyStore';
import GoalCard from '../components/GoalCard';
import type { GoalType } from '../types';
import Confetti from '../components/Confetti';

const GOAL_EMOJIS = ['🏖️', '🚲', '🎬', '🏠', '🎄', '🚀', '⛺', '🏔️', '🎸', '🐶', '🌍', '🎢', '🏋️', '📸', '🎯'];

const goalTypes: { value: GoalType; label: string; emoji: string; color: string }[] = [
  { value: 'vacation', label: 'Urlaub', emoji: '✈️', color: 'from-blue-500 to-cyan-500' },
  { value: 'savings', label: 'Sparziel', emoji: '💰', color: 'from-green-500 to-emerald-500' },
  { value: 'project', label: 'Projekt', emoji: '🔨', color: 'from-purple-500 to-violet-500' },
  { value: 'challenge', label: 'Challenge', emoji: '🏆', color: 'from-orange-500 to-red-500' },
];

export default function Goals() {
  const { goals, addGoal, contributeToGoal, members } = useFamilyStore();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [type, setType] = useState<GoalType>('challenge');
  const [targetXP, setTargetXP] = useState(1000);
  const [targetDate, setTargetDate] = useState('');

  // Contribute state
  const [contributeAmount, setContributeAmount] = useState(50);
  const [contributeMemberId, setContributeMemberId] = useState('');

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  const handleAddGoal = () => {
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim(),
      emoji,
      type,
      targetXP,
      targetDate: targetDate || null,
    });
    setTitle('');
    setDescription('');
    setEmoji('🎯');
    setType('challenge');
    setTargetXP(1000);
    setTargetDate('');
    setShowAddGoal(false);
  };

  const handleContribute = () => {
    if (!showContribute || !contributeMemberId) return;
    const member = members.find((m) => m.id === contributeMemberId);
    if (!member || member.xp < contributeAmount) return;

    contributeToGoal(showContribute, contributeAmount);
    setShowContribute(null);
    setContributeAmount(50);
    setContributeMemberId('');

    // Check if goal is now completed
    const goal = goals.find((g) => g.id === showContribute);
    if (goal && goal.currentXP + contributeAmount >= goal.targetXP) {
      setShowConfetti(true);
    }
  };

  const totalGoalXP = goals.reduce((s, g) => s + g.currentXP, 0);
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-white">🎯 Ziele</h1>
          <p className="text-gray-400 text-sm">Familienabenteuer</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddGoal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Neues Ziel
        </motion.button>
      </motion.div>

      {/* Overview stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 pointer-events-none" />
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-black text-blue-400">{activeGoals.length}</div>
            <div className="text-xs text-gray-500">Aktive Ziele</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-green-400">{completedGoals.length}</div>
            <div className="text-xs text-gray-500">Erreicht</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-400">{completionRate}%</div>
            <div className="text-xs text-gray-500">Erfolgsrate</div>
          </div>
        </div>

        {/* Total progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1"><TrendingUp size={11} /> Gesamt-Fortschritt</span>
            <span>{totalGoalXP.toLocaleString()} XP beigesteuert</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (totalGoalXP / Math.max(goals.reduce((s, g) => s + g.targetXP, 0), 1)) * 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Target size={16} className="text-blue-400" />
            Aktive Ziele
          </h2>
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={() => setShowContribute(goal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Erreichte Ziele
          </h2>
          <div className="space-y-4">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="glass-card p-10 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-white font-bold text-lg">Keine Ziele gesetzt</p>
          <p className="text-gray-400 text-sm mt-1">Erstelle euer erstes Familienziel!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddGoal(true)}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Ziel erstellen
          </motion.button>
        </div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddGoal(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="relative w-full max-w-lg glass-card p-6 z-10 max-h-[90dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Neues Ziel</h2>
                  <p className="text-gray-400 text-sm">Familienabenteuer erstellen</p>
                </div>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Emoji picker */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Emoji wählen</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border transition-all ${
                          emoji === e
                            ? 'border-purple-500/60 bg-purple-500/20 scale-110'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Ziel-Name *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Was wollt ihr erreichen?"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500/60"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Beschreibung</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details..."
                    rows={2}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500/60 resize-none"
                  />
                </div>

                {/* Goal type */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Zieltyp</label>
                  <div className="grid grid-cols-2 gap-2">
                    {goalTypes.map((gt) => (
                      <button
                        key={gt.value}
                        onClick={() => setType(gt.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                          type === gt.value
                            ? `bg-gradient-to-r ${gt.color} text-white border-transparent shadow-lg`
                            : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {gt.emoji} {gt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target XP */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">
                    Ziel-XP: <span className="text-yellow-400 font-bold">{targetXP.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    step={100}
                    value={targetXP}
                    onChange={(e) => setTargetXP(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100</span>
                    <span>2.500</span>
                    <span>5.000</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Verfügbare Familie XP: {members.reduce((s, m) => s + m.xp, 0).toLocaleString()}
                  </p>
                </div>

                {/* Target date */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Zieldatum (optional)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/60"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddGoal}
                  disabled={!title.trim()}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    title.trim() ? 'btn-primary' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Ziel erstellen 🎯
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contribute Modal */}
      <AnimatePresence>
        {showContribute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowContribute(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass-card p-6 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">XP beisteuern</h2>
                <button onClick={() => setShowContribute(null)}>
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Member select */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Wer steuert bei?</label>
                  <select
                    value={contributeMemberId}
                    onChange={(e) => setContributeMemberId(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none focus:border-purple-500/60"
                  >
                    <option value="" className="bg-gray-900">Mitglied wählen...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id} className="bg-gray-900">
                        {m.avatar} {m.name} ({m.xp} XP)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Menge: <span className="text-yellow-400 font-bold">{contributeAmount} XP</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {contributeMemberId && (
                  <p className={`text-xs ${
                    (members.find(m => m.id === contributeMemberId)?.xp ?? 0) >= contributeAmount
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {(members.find(m => m.id === contributeMemberId)?.xp ?? 0) >= contributeAmount
                      ? '✓ Genug XP vorhanden'
                      : '✗ Nicht genug XP'
                    }
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContribute}
                  disabled={!contributeMemberId || (members.find(m => m.id === contributeMemberId)?.xp ?? 0) < contributeAmount}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    contributeMemberId && (members.find(m => m.id === contributeMemberId)?.xp ?? 0) >= contributeAmount
                      ? 'btn-primary'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {contributeAmount} XP beisteuern ⭐
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddGoal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full shadow-glow-blue flex items-center justify-center z-30"
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
