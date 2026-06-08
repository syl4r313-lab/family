import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Lock, Check, Zap } from 'lucide-react';
import type { Reward, FamilyMember } from '../types';
import { useFamilyStore } from '../store/useFamilyStore';

interface RewardCardProps {
  reward: Reward;
  members: FamilyMember[];
}

export default function RewardCard({ reward, members }: RewardCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [purchased, setPurchased] = useState(false);
  const purchaseReward = useFamilyStore((s) => s.purchaseReward);

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const canAfford = selectedMember ? selectedMember.xp >= reward.xpCost : false;

  const handlePurchase = () => {
    if (!selectedMemberId) return;
    const success = purchaseReward(reward.id, selectedMemberId);
    if (success) {
      setPurchased(true);
      setShowConfirm(false);
      setTimeout(() => setPurchased(false), 3000);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`card p-4 relative overflow-hidden ${!reward.available ? 'opacity-50' : ''}`}
    >
      {/* Success flash */}
      <AnimatePresence>
        {purchased && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-50 border border-emerald-200 rounded-2xl z-10 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Check size={36} className="text-emerald-500 mx-auto" />
              </motion.div>
              <p className="text-emerald-600 font-bold mt-2 text-sm">Eingelöst! 🎉</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji */}
      <div className="text-4xl mb-3 text-center">{reward.emoji}</div>

      {/* Info */}
      <h3 className="font-bold text-gray-900 text-sm text-center mb-1">{reward.title}</h3>
      <p className="text-gray-500 text-xs text-center line-clamp-2">{reward.description}</p>

      {/* XP Cost */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <Zap size={13} className="text-amber-500" />
        <span className="text-amber-600 font-black text-lg">{reward.xpCost}</span>
        <span className="text-gray-400 text-sm">XP</span>
      </div>

      {!reward.available && (
        <div className="mt-2 flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Lock size={10} />
          <span>Nicht verfügbar</span>
        </div>
      )}

      {reward.available && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConfirm(!showConfirm)}
          className="mt-3 w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={13} />
          Kaufen
        </motion.button>
      )}

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium text-center">Wer kauft das?</p>

              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm mb-2 outline-none focus:border-emerald-400"
              >
                <option value="">Mitglied wählen...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.xp.toLocaleString()} XP)
                  </option>
                ))}
              </select>

              {selectedMemberId && !canAfford && (
                <p className="text-red-500 text-xs text-center mb-2">
                  Nicht genug XP! Noch {reward.xpCost - (selectedMember?.xp || 0)} XP nötig.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 btn-secondary text-xs py-1.5"
                >
                  Abbrechen
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePurchase}
                  disabled={!selectedMemberId || !canAfford}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    selectedMemberId && canAfford
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Bestätigen ✓
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
