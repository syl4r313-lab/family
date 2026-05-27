import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Star, Zap } from 'lucide-react';
import type { Quest, FamilyMember } from '../types';
import { useFamilyStore } from '../store/useFamilyStore';

interface QuestCardProps {
  quest: Quest;
  members: FamilyMember[];
  onComplete?: (result: { xpGained: number; leveledUp: boolean; newLevel: number; memberName: string }) => void;
}

const categoryConfig = {
  chores: { label: 'Haushalt', color: 'bg-blue-500/30 text-blue-300 border-blue-500/30', emoji: '🧹' },
  homework: { label: 'Hausaufgaben', color: 'bg-purple-500/30 text-purple-300 border-purple-500/30', emoji: '📚' },
  errands: { label: 'Besorgungen', color: 'bg-orange-500/30 text-orange-300 border-orange-500/30', emoji: '🛒' },
  fun: { label: 'Spaß', color: 'bg-pink-500/30 text-pink-300 border-pink-500/30', emoji: '🎮' },
  health: { label: 'Gesundheit', color: 'bg-green-500/30 text-green-300 border-green-500/30', emoji: '💪' },
};

const difficultyConfig = {
  easy: { label: 'Einfach', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', emoji: '🟢' },
  medium: { label: 'Mittel', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', emoji: '🟡' },
  hard: { label: 'Schwer', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', emoji: '🔴' },
};

export default function QuestCard({ quest, members, onComplete }: QuestCardProps) {
  const [showMemberSelect, setShowMemberSelect] = useState(false);
  const completeQuest = useFamilyStore((s) => s.completeQuest);

  const assignee = members.find((m) => m.id === quest.assigneeId);
  const catConfig = categoryConfig[quest.category];
  const diffConfig = difficultyConfig[quest.difficulty];

  const isOverdue = quest.dueDate
    ? new Date(quest.dueDate) < new Date() && !quest.completed
    : false;

  const completedByMember = quest.completedBy
    ? members.find((m) => m.id === quest.completedBy)
    : null;

  const handleComplete = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    const result = completeQuest(quest.id, memberId);
    setShowMemberSelect(false);
    if (onComplete) {
      onComplete({ ...result, memberName: member.name });
    }
  };

  const eligibleMembers = quest.assigneeId
    ? members.filter((m) => m.id === quest.assigneeId)
    : members;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!quest.completed ? { y: -2 } : {}}
      className={`glass-card p-4 relative overflow-hidden transition-all ${
        quest.completed ? 'opacity-60' : ''
      } ${isOverdue ? 'border-red-500/40' : ''}`}
    >
      {/* Completed overlay stripe */}
      {quest.completed && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
      )}

      {/* Category color accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${
        quest.category === 'chores' ? 'from-blue-500 to-blue-700' :
        quest.category === 'homework' ? 'from-purple-500 to-purple-700' :
        quest.category === 'errands' ? 'from-orange-500 to-orange-700' :
        quest.category === 'fun' ? 'from-pink-500 to-pink-700' :
        'from-green-500 to-green-700'
      }`} />

      <div className="pl-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-bold text-base ${quest.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                {quest.title}
              </h3>
              {quest.completed && (
                <CheckCircle size={16} className="text-green-400 shrink-0" />
              )}
            </div>
            {quest.description && (
              <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{quest.description}</p>
            )}
          </div>

          {/* XP Badge */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Zap size={12} />
              {quest.xpReward} XP
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Category badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${catConfig.color}`}>
            {catConfig.emoji} {catConfig.label}
          </span>

          {/* Difficulty badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${diffConfig.bg} ${diffConfig.color}`}>
            {diffConfig.emoji} {diffConfig.label}
          </span>

          {/* Due date */}
          {quest.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
              <Clock size={11} />
              {isOverdue ? 'Überfällig!' : `Fällig ${new Date(quest.dueDate).toLocaleDateString('de-DE')}`}
            </span>
          )}
        </div>

        {/* Assignee / Completed by */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {quest.completed && completedByMember ? (
              <div className="flex items-center gap-1.5 text-green-400 text-sm">
                <span className="text-lg">{completedByMember.avatar}</span>
                <span className="font-medium">{completedByMember.name}</span>
                <Star size={12} className="text-yellow-400" />
              </div>
            ) : assignee ? (
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <span className="text-lg">{assignee.avatar}</span>
                <span>{assignee.name}</span>
              </div>
            ) : (
              <span className="text-gray-500 text-xs">Für alle</span>
            )}
          </div>

          {/* Complete button */}
          {!quest.completed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (eligibleMembers.length === 1) {
                  handleComplete(eligibleMembers[0].id);
                } else {
                  setShowMemberSelect(!showMemberSelect);
                }
              }}
              className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              <CheckCircle size={14} />
              Erledigt!
            </motion.button>
          )}
        </div>

        {/* Member selection dropdown */}
        <AnimatePresence>
          {showMemberSelect && !quest.completed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 bg-black/30 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-2 font-medium">Wer hat das erledigt?</p>
                <div className="flex flex-wrap gap-2">
                  {eligibleMembers.map((member) => (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleComplete(member.id)}
                      className="flex items-center gap-2 bg-white/10 hover:bg-purple-500/30 border border-white/20 hover:border-purple-500/40 rounded-xl px-3 py-2 transition-colors"
                    >
                      <span className="text-xl">{member.avatar}</span>
                      <span className="text-sm font-medium text-white">{member.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
