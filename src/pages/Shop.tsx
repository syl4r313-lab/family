import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { useFamilyStore } from '../store/useFamilyStore';
import RewardCard from '../components/RewardCard';

export default function Shop() {
  const { rewards, members, addReward } = useFamilyStore();
  const [showAddReward, setShowAddReward] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [xpCost, setXpCost] = useState(100);

  const REWARD_EMOJIS = ['🎁', '🎮', '📱', '🍕', '🎬', '🎠', '🎪', '🏖️', '🎯', '🍦', '🎸', '⚽', '🎨', '📚', '🌙', '🎫', '🏆', '🍔', '🍿', '🎉'];

  const totalMemberXP = members.reduce((s, m) => s + m.xp, 0);

  const handleAddReward = () => {
    if (!title.trim()) return;
    addReward({
      title: title.trim(),
      description: description.trim(),
      emoji,
      xpCost,
      available: true,
    });
    setTitle('');
    setDescription('');
    setEmoji('🎁');
    setXpCost(100);
    setShowAddReward(false);
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-white">🛍️ Belohnungs-Shop</h1>
          <p className="text-gray-400 text-sm">XP gegen Belohnungen einlösen</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddReward(true)}
          className="flex items-center gap-2 bg-pink-600/30 hover:bg-pink-600/40 border border-pink-500/30 text-pink-300 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          Neu
        </motion.button>
      </motion.div>

      {/* XP Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-purple-600/10 pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={18} className="text-yellow-400" />
          <h3 className="font-bold text-white">Familien-XP Übersicht</h3>
        </div>
        <div className="space-y-2">
          {[...members].sort((a, b) => b.xp - a.xp).map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{member.avatar}</span>
                <span className="text-sm font-medium text-white">{member.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Star size={13} />
                <span className="font-bold text-sm">{member.xp.toLocaleString()} XP</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Gesamt verfügbar</span>
          <div className="flex items-center gap-1.5 text-yellow-400 font-black text-lg">
            <Star size={16} />
            {totalMemberXP.toLocaleString()} XP
          </div>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <ShoppingBag size={20} className="text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm mb-1">So funktioniert's</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✅ Quests erledigen → XP sammeln</li>
              <li>🛒 XP gegen Belohnungen einlösen</li>
              <li>👑 Eltern können neue Belohnungen hinzufügen</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Rewards grid */}
      <h2 className="text-base font-bold text-white mb-3">Verfügbare Belohnungen</h2>
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <RewardCard reward={reward} members={members} />
          </motion.div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="glass-card p-10 text-center col-span-2">
          <div className="text-5xl mb-3">🛍️</div>
          <p className="text-white font-bold">Keine Belohnungen</p>
          <p className="text-gray-400 text-sm mt-1">Füge Belohnungen für die Familie hinzu!</p>
        </div>
      )}

      {/* Add Reward Modal */}
      <AnimatePresence>
        {showAddReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddReward(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="relative w-full max-w-md glass-card p-6 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Belohnung erstellen</h2>
                  <p className="text-gray-400 text-sm">Neue Belohnung für den Shop</p>
                </div>
                <button
                  onClick={() => setShowAddReward(false)}
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
                    {REWARD_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border transition-all ${
                          emoji === e
                            ? 'border-pink-500/60 bg-pink-500/20 scale-110'
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
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Belohnung *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Name der Belohnung..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-pink-500/60"
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
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-pink-500/60 resize-none"
                  />
                </div>

                {/* XP Cost */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">
                    Preis: <span className="text-yellow-400 font-bold">{xpCost} XP</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    step={10}
                    value={xpCost}
                    onChange={(e) => setXpCost(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10 XP</span>
                    <span>500 XP</span>
                    <span>1000 XP</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="text-4xl">{emoji}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{title || 'Belohnungsname...'}</div>
                    <div className="text-xs text-gray-400">{description || 'Beschreibung...'}</div>
                    <div className="flex items-center gap-1 text-yellow-400 mt-1">
                      <Star size={12} />
                      <span className="text-sm font-bold">{xpCost} XP</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddReward}
                  disabled={!title.trim()}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    title.trim()
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus size={18} />
                  Belohnung hinzufügen
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
        onClick={() => setShowAddReward(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full shadow-glow-pink flex items-center justify-center z-30"
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
