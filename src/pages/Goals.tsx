import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target, CheckCircle } from 'lucide-react';
import { useFamilyStore } from '../store/useFamilyStore';
import GoalCard from '../components/GoalCard';
import ContributeModal from '../components/ContributeModal';
import Confetti from '../components/Confetti';
import type { GoalType, FamilyGoal } from '../types';

const GOAL_EMOJIS = ['🏖️', '🚲', '🎬', '🏠', '🎄', '🚀', '⛺', '🏔️', '🎸', '🐶', '🌍', '🎢', '🏋️', '📸', '🎯'];

const goalTypes: { value: GoalType; label: string; emoji: string }[] = [
  { value: 'vacation', label: 'Urlaub', emoji: '✈️' },
  { value: 'savings', label: 'Sparziel', emoji: '💰' },
  { value: 'purchase', label: 'Kauf', emoji: '🛒' },
  { value: 'project', label: 'Projekt', emoji: '🔨' },
  { value: 'challenge', label: 'Challenge', emoji: '🏆' },
];

export default function Goals() {
  const { goals, addGoal, members } = useFamilyStore();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<FamilyGoal | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [type, setType] = useState<GoalType>('challenge');
  const [targetAmount, setTargetAmount] = useState('');
  const [xpBonus, setXpBonus] = useState('500');
  const [targetDate, setTargetDate] = useState('');

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  const handleAddGoal = () => {
    if (!title.trim() || !targetAmount) return;
    addGoal({
      title: title.trim(),
      description: description.trim(),
      emoji,
      type,
      targetAmount: parseFloat(targetAmount),
      xpBonusOnComplete: parseInt(xpBonus) || 500,
      targetDate: targetDate || null,
    });
    setTitle('');
    setDescription('');
    setEmoji('🎯');
    setType('challenge');
    setTargetAmount('');
    setXpBonus('500');
    setTargetDate('');
    setShowAddGoal(false);
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <ContributeModal
        goal={contributeGoal}
        members={members}
        onClose={() => setContributeGoal(null)}
        onSuccess={() => setShowConfetti(true)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900">Familienziele</h1>
          <p className="text-gray-500 text-sm">Gemeinsam sparen & erreichen</p>
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
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="card p-4 mb-6"
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-xl font-black text-violet-600">{activeGoals.length}</div>
              <div className="text-xs text-gray-500">Aktive Ziele</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-emerald-600">{completedGoals.length}</div>
              <div className="text-xs text-gray-500">Erreicht</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-amber-600">{completionRate}%</div>
              <div className="text-xs text-gray-500">Erfolgsrate</div>
            </div>
          </div>

          {totalTarget > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Gespart: € {totalSaved.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>Ziel: € {totalTarget.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Target size={14} className="text-violet-500" />
            Aktive Ziele
          </h2>
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={() => setContributeGoal(goal)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle size={14} className="text-emerald-500" />
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
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-gray-800 font-bold text-lg">Keine Ziele gesetzt</p>
          <p className="text-gray-500 text-sm mt-1">Erstelle euer erstes Familienziel!</p>
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
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Neues Ziel</h2>
                  <p className="text-gray-500 text-sm">Familienziel erstellen</p>
                </div>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Emoji picker */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Emoji wählen</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border transition-all ${
                          emoji === e
                            ? 'border-emerald-400 bg-emerald-50 scale-110 shadow-sm'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Ziel-Name *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Was wollt ihr erreichen?"
                    className="input-field"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Beschreibung</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>

                {/* Goal type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Zieltyp</label>
                  <div className="grid grid-cols-3 gap-2">
                    {goalTypes.map((gt) => (
                      <button
                        key={gt.value}
                        onClick={() => setType(gt.value)}
                        className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                          type === gt.value
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {gt.emoji} {gt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target amount */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Zielbetrag (€) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                    <input
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0,00"
                      min="1"
                      step="1"
                      className="input-field pl-7"
                    />
                  </div>
                </div>

                {/* XP Bonus */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    XP-Bonus bei Abschluss (optional)
                  </label>
                  <input
                    type="number"
                    value={xpBonus}
                    onChange={(e) => setXpBonus(e.target.value)}
                    placeholder="500"
                    min="0"
                    step="50"
                    className="input-field"
                  />
                </div>

                {/* Target date */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Zieldatum (optional)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddGoal}
                  disabled={!title.trim() || !targetAmount}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    title.trim() && targetAmount ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Ziel erstellen 🎯
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
        className="fixed bottom-24 right-4 w-14 h-14 btn-primary rounded-full shadow-lg flex items-center justify-center z-30"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
