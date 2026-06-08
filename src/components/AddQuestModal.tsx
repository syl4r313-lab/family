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

const difficulties: { value: Difficulty; label: string; dot: string; active: string }[] = [
  { value: 'easy', label: 'Einfach', dot: '🟢', active: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
  { value: 'medium', label: 'Mittel', dot: '🟡', active: 'bg-amber-50 border-amber-300 text-amber-700' },
  { value: 'hard', label: 'Schwer', dot: '🔴', active: 'bg-red-50 border-red-300 text-red-700' },
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
          <div className="absolute inset-0 bg-black/40" />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Neue Quest</h2>
                <p className="text-gray-500 text-sm">Erstelle eine neue Aufgabe</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Quest-Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Was ist die Aufgabe?"
                  className="input-field"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Beschreibung</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Genauere Details..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Kategorie</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        category === cat.value
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Schwierigkeit</label>
                <div className="flex gap-2">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => setDifficulty(diff.value)}
                      className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        difficulty === diff.value
                          ? diff.active
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span>{diff.dot}</span>
                      <span className="text-xs">{diff.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-amber-600 text-sm">
                  <Zap size={13} className="text-amber-500" />
                  <span className="font-bold">{xpReward} XP</span>
                  <span className="text-gray-400">Belohnung</span>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Users size={13} />
                  Zugewiesen an
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAssigneeId('')}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      assigneeId === ''
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Alle
                  </button>
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAssigneeId(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        assigneeId === m.id
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {m.avatarType === 'photo' ? (
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs">{m.avatar}</span>
                        )}
                      </div>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} />
                  Fälligkeitsdatum
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!title.trim()}
                className={`w-full py-3 rounded-lg font-bold text-base transition-all ${
                  title.trim() ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
