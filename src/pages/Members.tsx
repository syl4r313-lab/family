import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, UserPlus } from 'lucide-react';
import { useFamilyStore } from '../store/useFamilyStore';
import MemberCard from '../components/MemberCard';
import type { Role } from '../types';

const AVATAR_OPTIONS = ['👨', '👩', '👦', '👧', '🧑', '👴', '👵', '🧒', '🧔', '💁', '🙋', '🤴', '👸', '🦸', '🧙'];

export default function Members() {
  const { members, quests, addMember } = useFamilyStore();
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [role, setRole] = useState<Role>('child');

  const sortedMembers = [...members].sort((a, b) => b.xp - a.xp);
  const viewedMember = members.find((m) => m.id === selectedMember);
  const memberQuests = selectedMember
    ? quests.filter((q) => q.completedBy === selectedMember)
    : [];

  const handleAddMember = () => {
    if (!name.trim()) return;
    addMember({ name: name.trim(), avatar, role });
    setName('');
    setAvatar('👤');
    setRole('child');
    setShowAddMember(false);
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
          <h1 className="text-2xl font-black text-white">👨‍👩‍👧‍👦 Familie</h1>
          <p className="text-gray-400 text-sm">{members.length} Familienmitglieder</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddMember(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={16} />
          Hinzufügen
        </motion.button>
      </motion.div>

      {/* Family stats summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 pointer-events-none" />
        <h3 className="text-sm font-bold text-gray-400 mb-3">Familienübersicht</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/20 rounded-xl p-3">
            <div className="text-2xl font-black text-yellow-400">
              {members.reduce((s, m) => s + m.xp, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Gesamt XP</div>
          </div>
          <div className="bg-black/20 rounded-xl p-3">
            <div className="text-2xl font-black text-green-400">
              {members.reduce((s, m) => s + m.completedQuests, 0)}
            </div>
            <div className="text-xs text-gray-500">Quests erledigt</div>
          </div>
          <div className="bg-black/20 rounded-xl p-3">
            <div className="text-2xl font-black text-orange-400">
              {Math.max(...members.map((m) => m.streak))}🔥
            </div>
            <div className="text-xs text-gray-500">Höchster Streak</div>
          </div>
          <div className="bg-black/20 rounded-xl p-3">
            <div className="text-2xl font-black text-blue-400">
              {Math.max(...members.map((m) => m.level))}
            </div>
            <div className="text-xs text-gray-500">Höchstes Level</div>
          </div>
        </div>
      </motion.div>

      {/* Member cards */}
      <div className="space-y-4">
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MemberCard
              member={member}
              rank={index}
              onClick={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
            />

            {/* Expanded detail view */}
            <AnimatePresence>
              {selectedMember === member.id && viewedMember && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-card mt-2 p-4 border-purple-500/30">
                    <h4 className="text-sm font-bold text-purple-400 mb-3">
                      🏅 Errungenschaften von {viewedMember.name}
                    </h4>

                    {viewedMember.badges.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {viewedMember.badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2"
                          >
                            <span className="text-2xl">{badge.emoji}</span>
                            <div>
                              <div className="text-xs font-bold text-yellow-300">{badge.name}</div>
                              <div className="text-xs text-gray-500">{badge.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">Noch keine Errungenschaften.</p>
                    )}

                    {memberQuests.length > 0 && (
                      <>
                        <h4 className="text-sm font-bold text-green-400 mb-2">
                          ✅ Abgeschlossene Quests ({memberQuests.length})
                        </h4>
                        <div className="space-y-1.5">
                          {memberQuests.slice(0, 5).map((q) => (
                            <div key={q.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                              <span className="text-xs text-gray-300">{q.title}</span>
                              <span className="text-xs text-yellow-400 font-bold">+{q.xpReward} XP</span>
                            </div>
                          ))}
                          {memberQuests.length > 5 && (
                            <p className="text-xs text-gray-500 text-center">
                              ...und {memberQuests.length - 5} weitere
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddMember(false)}
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
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Mitglied hinzufügen</h2>
                  <p className="text-gray-400 text-sm">Neues Familienmitglied</p>
                </div>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Avatar selection */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Avatar wählen</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAvatar(a)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border transition-all ${
                          avatar === a
                            ? 'border-purple-500/60 bg-purple-500/20 scale-110'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name eingeben..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500/60"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm text-gray-400 font-medium mb-2 block">Rolle</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRole('parent')}
                      className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                        role === 'parent'
                          ? 'border-blue-500/60 bg-blue-500/20 text-blue-300'
                          : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      👑 Elternteil
                    </button>
                    <button
                      onClick={() => setRole('child')}
                      className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                        role === 'child'
                          ? 'border-pink-500/60 bg-pink-500/20 text-pink-300'
                          : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      ⭐ Kind
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-black/20 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center text-3xl">
                    {avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{name || 'Name...'}</div>
                    <div className="text-xs text-gray-400">
                      {role === 'parent' ? '👑 Elternteil' : '⭐ Kind'} · Level 1 · 0 XP
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddMember}
                  disabled={!name.trim()}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    name.trim()
                      ? 'btn-primary'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus size={18} />
                  Zur Familie hinzufügen
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
