import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Calendar, Users } from 'lucide-react';
import type { Category, Difficulty, FamilyMember } from '../types';
import { useFamilyStore, getDifficultyXP } from '../store/useFamilyStore';

interface AddQuestModalProps {
  visible: boolean;
  members: FamilyMember[];
  onClose: () => void;
}

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: 'chores', label: 'Haushalt', emoji: '🧹' },
  { value: 'homework', label: 'Hausaufgaben', emoji: '📚' },
  { value: 'errands', label: 'Besorgungen', emoji: '🛒' },
  { value: 'fun', label: 'Spaß', emoji: '🎮' },
  { value: 'health', label: 'Gesundheit', emoji: '💪' },
];

const difficulties: { value: Difficulty; label: string; emoji: string; color: string }[] = [
  { value: 'easy', label: 'Einfach', emoji: '🟢', color: 'border-green-500/60 bg-green-500/20 text-green-300' },
  { value: 'medium', label: 'Mittel', emoji: '🟡', color: 'border-yellow-500/60 bg-yellow-500/20 text-yellow-300' },
  { value: 'hard', label: 'Schwer', emoji: '🔴', color: 'border-red-500/60 bg-red-500/20 text-red-300' },
];

export default function AddQuestModal({ visible, members, onClose }: AddQuestModalProps) {
  const addQuest = useFamilyStore((s) => s.addQuest);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [category, setCategory] = useState<Category>('chores');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [dueDate, setDueDate] = useState('');

  const xpReward = getDifficultyXP(difficulty);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addQuest({
      title: title.trim(),
      description: description.trim(),
      assigneeId: assigneeId || null,
      xpReward,
      difficulty,
      category,
      dueDate: dueDate || null,
    });
    // Reset
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setCategory('chores');
    setDifficulty('easy');
    setDueDate('');
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative w-full max-w-lg glass-card p-6 z-10 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Neue Quest</h2>
                <p className="text-gray-400 text-sm">Erstelle eine neue Aufgabe</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Quest-Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Was ist die Aufgabe?"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500/60 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Beschreibung</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Genauere Details..."
                  rows={2}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500/60 transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Kategorie</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        category === cat.value
                          ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                          : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Schwierigkeit</label>
                <div className="flex gap-2">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => setDifficulty(diff.value)}
                      className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        difficulty === diff.value
                          ? diff.color
                          : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span>{diff.emoji}</span>
                      <span className="text-xs">{diff.label}</span>
                    </button>
                  ))}
                </div>

                {/* XP Preview */}
                <div className="mt-2 flex items-center gap-1.5 text-yellow-400 text-sm">
                  <Zap size={14} />
                  <span className="font-bold">{xpReward} XP</span>
                  <span className="text-gray-500">Belohnung</span>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                  <Users size={13} />
                  Zugewiesen an
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAssigneeId('')}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      assigneeId === ''
                        ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                        : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    Alle
                  </button>
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAssigneeId(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        assigneeId === m.id
                          ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                          : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span>{m.avatar}</span>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                  <Calendar size={13} />
                  Fälligkeitsdatum
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/60 transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!title.trim()}
                className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
                  title.trim()
                    ? 'btn-primary shadow-glow-purple'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                Quest erstellen ⚔️
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
