import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShoppingBag, Zap } from 'lucide-react';
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
    addReward({ title: title.trim(), description: description.trim(), emoji, xpCost, available: true });
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
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900">Belohnungs-Shop</h1>
          <p className="text-gray-500 text-sm">XP gegen Belohnungen einlösen</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddReward(true)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Plus size={14} />
          Neu
        </motion.button>
      </motion.div>

      {/* XP Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="card p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-amber-500" />
          <h3 className="font-bold text-gray-800 text-sm">Familien-XP Übersicht</h3>
        </div>
        {members.length > 0 ? (
          <div className="space-y-2">
            {[...members].sort((a, b) => b.xp - a.xp).map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {member.avatarType === 'photo' ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{member.avatar}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{member.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Zap size={12} />
                  <span className="font-bold text-sm">{member.xp.toLocaleString()} XP</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Noch keine Familienmitglieder.</p>
        )}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-gray-500 text-sm">Gesamt verfügbar</span>
          <div className="flex items-center gap-1.5 text-amber-500 font-black text-lg">
            <Zap size={16} />
            {totalMemberXP.toLocaleString()} XP
          </div>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <ShoppingBag size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">So funktioniert's</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✅ Quests erledigen → XP sammeln</li>
              <li>🛒 XP gegen Belohnungen einlösen</li>
              <li>👑 Eltern können neue Belohnungen hinzufügen</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Rewards grid */}
      {rewards.length > 0 ? (
        <>
          <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Verfügbare Belohnungen</h2>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <RewardCard reward={reward} members={members} />
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">🛍️</div>
          <p className="text-gray-800 font-bold">Keine Belohnungen</p>
          <p className="text-gray-500 text-sm mt-1">Füge Belohnungen für die Familie hinzu!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddReward(true)}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Belohnung hinzufügen
          </motion.button>
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
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Belohnung erstellen</h2>
                  <p className="text-gray-500 text-sm">Neue Belohnung für den Shop</p>
                </div>
                <button
                  onClick={() => setShowAddReward(false)}
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
                    {REWARD_EMOJIS.map((e) => (
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
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Belohnung *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Name der Belohnung..."
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

                {/* XP Cost */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Preis: <span className="text-amber-500 font-bold">{xpCost} XP</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    step={10}
                    value={xpCost}
                    onChange={(e) => setXpCost(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10 XP</span>
                    <span>500 XP</span>
                    <span>1000 XP</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                  <div className="text-4xl">{emoji}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{title || 'Belohnungsname...'}</div>
                    <div className="text-xs text-gray-500">{description || 'Beschreibung...'}</div>
                    <div className="flex items-center gap-1 text-amber-500 mt-1">
                      <Zap size={12} />
                      <span className="text-sm font-bold">{xpCost} XP</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddReward}
                  disabled={!title.trim()}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    title.trim() ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
        className="fixed bottom-24 right-4 w-14 h-14 btn-primary rounded-full shadow-lg flex items-center justify-center z-30"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
