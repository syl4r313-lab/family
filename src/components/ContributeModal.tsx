import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Euro } from 'lucide-react';
import type { FamilyMember, FamilyGoal } from '../types';
import { useFamilyStore } from '../store/useFamilyStore';

interface ContributeModalProps {
  goal: FamilyGoal | null;
  members: FamilyMember[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ContributeModal({ goal, members, onClose, onSuccess }: ContributeModalProps) {
  const { contributeToGoal } = useFamilyStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [contributorId, setContributorId] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const remaining = goal ? goal.targetAmount - goal.currentAmount : 0;
  const canSubmit = amountNum > 0 && amountNum <= remaining;

  const handleSubmit = () => {
    if (!goal || !canSubmit) return;
    contributeToGoal(goal.id, amountNum, note || 'Einzahlung', contributorId);
    const wasCompleted = goal.currentAmount + amountNum >= goal.targetAmount;
    if (wasCompleted) onSuccess?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {goal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Geld einzahlen</h2>
                <p className="text-gray-500 text-sm">{goal.emoji} {goal.title}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Remaining */}
            <div className="bg-emerald-50 rounded-xl p-3 mb-5 text-center">
              <p className="text-xs text-emerald-600 font-medium">Noch ausstehend</p>
              <p className="text-2xl font-black text-emerald-700">€ {remaining.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Betrag (€) *
                </label>
                <div className="relative">
                  <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    min="0.01"
                    step="0.01"
                    max={remaining}
                    className="input-field pl-9"
                    autoFocus
                  />
                </div>
                {amountNum > remaining && (
                  <p className="text-red-500 text-xs mt-1">Betrag übersteigt das Ziel ({remaining.toFixed(2)} € verbleibend)</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Wofür? (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="z.B. Taschengeldspareinlage"
                  className="input-field"
                />
              </div>

              {/* Contributor */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Wer zahlt ein?
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setContributorId(null)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      contributorId === null
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    👨‍👩‍👧‍👦 Familie
                  </button>
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setContributorId(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        contributorId === m.id
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {m.avatarType === 'photo' ? (
                        <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <span>{m.avatar}</span>
                      )}
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={canSubmit ? { scale: 1.02 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  canSubmit
                    ? 'btn-primary'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                € {amountNum > 0 ? amountNum.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} einzahlen
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
