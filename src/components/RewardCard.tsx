import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Lock, Check, Star } from 'lucide-react';
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
      className={`glass-card p-4 relative overflow-hidden ${!reward.available ? 'opacity-50' : ''}`}
    >
      {/* Success flash */}
      <AnimatePresence>
        {purchased && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/20 border border-green-500/40 rounded-2xl z-10 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <Check size={40} className="text-green-400 mx-auto" />
              </motion.div>
              <p className="text-green-400 font-bold mt-2">Eingelöst! 🎉</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji */}
      <div className="text-4xl mb-3 text-center">{reward.emoji}</div>

      {/* Info */}
      <h3 className="font-bold text-white text-sm text-center mb-1">{reward.title}</h3>
      <p className="text-gray-400 text-xs text-center line-clamp-2">{reward.description}</p>

      {/* XP Cost */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <Star size={14} className="text-yellow-400" />
        <span className="text-yellow-400 font-bold text-lg">{reward.xpCost}</span>
        <span className="text-gray-500 text-sm">XP</span>
      </div>

      {/* Available status */}
      {!reward.available && (
        <div className="mt-2 flex items-center justify-center gap-1 text-gray-500 text-xs">
          <Lock size={11} />
          <span>Nicht verfügbar</span>
        </div>
      )}

      {/* Buy button */}
      {reward.available && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConfirm(!showConfirm)}
          className="mt-3 w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={14} />
          Kaufen
        </motion.button>
      )}

      {/* Confirm purchase panel */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-black/30 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-gray-400 mb-2 font-medium text-center">Wer kauft das?</p>

              {/* Member select */}
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm mb-2 outline-none focus:border-purple-500/50"
              >
                <option value="" className="bg-gray-900">Mitglied wählen...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-gray-900">
                    {m.avatar} {m.name} ({m.xp.toLocaleString()} XP)
                  </option>
                ))}
              </select>

              {selectedMemberId && !canAfford && (
                <p className="text-red-400 text-xs text-center mb-2">
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
                  className={`flex-1 text-xs py-1.5 rounded-xl font-semibold transition-all ${
                    selectedMemberId && canAfford
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed'
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
