import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Pencil, Trophy, Flame, Zap } from 'lucide-react';
import { useFamilyStore } from '../store/useFamilyStore';
import EditMemberModal from '../components/EditMemberModal';
import type { FamilyMember } from '../types';

export default function Members() {
  const { members, quests } = useFamilyStore();
  const [editMember, setEditMember] = useState<FamilyMember | null | undefined>(undefined);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const sortedMembers = [...members].sort((a, b) => b.xp - a.xp);
  const viewedMember = members.find((m) => m.id === selectedMember);
  const memberQuests = selectedMember
    ? quests.filter((q) => q.completedBy === selectedMember)
    : [];

  const totalXP = members.reduce((s, m) => s + m.xp, 0);
  const totalQuests = members.reduce((s, m) => s + m.completedQuests, 0);
  const maxStreak = members.length > 0 ? Math.max(...members.map((m) => m.streak)) : 0;
  const maxLevel = members.length > 0 ? Math.max(...members.map((m) => m.level)) : 0;

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* EditMemberModal: null = new member, FamilyMember = edit, undefined = closed */}
      <EditMemberModal
        member={editMember}
        onClose={() => setEditMember(undefined)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900">Familie</h1>
          <p className="text-gray-500 text-sm">{members.length} Familienmitglieder</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setEditMember(null)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={16} />
          Hinzufügen
        </motion.button>
      </motion.div>

      {/* Family stats summary */}
      {members.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="card p-4 mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Familienübersicht</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <div className="text-xl font-black text-amber-600">
                {totalXP.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Gesamt XP</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="text-xl font-black text-emerald-600">{totalQuests}</div>
              <div className="text-xs text-gray-500">Quests erledigt</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <div className="text-xl font-black text-orange-600">{maxStreak}🔥</div>
              <div className="text-xs text-gray-500">Höchster Streak</div>
            </div>
            <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
              <div className="text-xl font-black text-violet-600">{maxLevel}</div>
              <div className="text-xs text-gray-500">Höchstes Level</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Member cards */}
      {members.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-10 text-center"
        >
          <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
          <p className="text-gray-800 font-bold text-lg">Noch keine Mitglieder</p>
          <p className="text-gray-500 text-sm mt-1">Füge Familienmitglieder hinzu!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setEditMember(null)}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <UserPlus size={16} />
            Mitglied hinzufügen
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sortedMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              {/* Member card */}
              <motion.div
                whileHover={{ y: -2 }}
                className="card p-4 cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
              >
                {/* Edit button */}
                <button
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMember(member);
                  }}
                >
                  <Pencil size={12} className="text-gray-500" />
                </button>

                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                      {member.avatarType === 'photo' ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{member.avatar}</span>
                      )}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -left-1 text-sm">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                    {member.streak > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-orange-100 border border-orange-200 rounded-full px-1 py-0.5 flex items-center gap-0.5">
                        <Flame size={9} className="text-orange-500" />
                        <span className="text-orange-600 text-xs font-bold">{member.streak}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base">{member.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        member.role === 'parent'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {member.role === 'parent' ? '👑 Elternteil' : '⭐ Kind'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        Level {member.level}
                      </span>
                    </div>

                    {/* XP bar */}
                    <div className="mt-2.5">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, (member.xp / Math.max(member.level * member.level * 50, 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-2.5">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Zap size={12} />
                        <span className="text-xs font-bold">{member.xp.toLocaleString()} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Trophy size={12} />
                        <span className="text-xs font-medium">{member.completedQuests} Quests</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {member.badges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {member.badges.slice(0, 6).map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.15 }}
                        title={badge.description}
                        className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-sm cursor-help"
                      >
                        {badge.emoji}
                      </motion.div>
                    ))}
                    {member.badges.length > 6 && (
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">
                        +{member.badges.length - 6}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Expanded detail view */}
              <AnimatePresence>
                {selectedMember === member.id && viewedMember && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="card mt-1.5 p-4 border-t-2 border-emerald-100">
                      <h4 className="text-sm font-bold text-emerald-700 mb-3">
                        🏅 Errungenschaften von {viewedMember.name}
                      </h4>

                      {viewedMember.badges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {viewedMember.badges.map((badge) => (
                            <div
                              key={badge.id}
                              className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2"
                            >
                              <span className="text-2xl">{badge.emoji}</span>
                              <div>
                                <div className="text-xs font-bold text-amber-700">{badge.name}</div>
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
                          <h4 className="text-sm font-bold text-emerald-700 mb-2">
                            Abgeschlossene Quests ({memberQuests.length})
                          </h4>
                          <div className="space-y-1.5">
                            {memberQuests.slice(0, 5).map((q) => (
                              <div key={q.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                <span className="text-xs text-gray-700">{q.title}</span>
                                <span className="text-xs text-amber-600 font-bold">+{q.xpReward} XP</span>
                              </div>
                            ))}
                            {memberQuests.length > 5 && (
                              <p className="text-xs text-gray-400 text-center">...und {memberQuests.length - 5} weitere</p>
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
      )}
    </div>
  );
}
