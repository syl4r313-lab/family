import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import type { Quest, FamilyMember } from '../types';
import { useFamilyStore } from '../store/useFamilyStore';

interface QuestCardProps {
  quest: Quest;
  members: FamilyMember[];
  onComplete?: (result: { xpGained: number; leveledUp: boolean; newLevel: number; memberName: string }) => void;
}

const categoryConfig = {
  chores: { label: 'Haushalt', bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', bar: 'bg-sky-400', emoji: '🧹' },
  homework: { label: 'Hausaufgaben', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', bar: 'bg-violet-400', emoji: '📚' },
  errands: { label: 'Besorgungen', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', bar: 'bg-orange-400', emoji: '🛒' },
  fun: { label: 'Spaß', bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700', bar: 'bg-pink-400', emoji: '🎮' },
  health: { label: 'Gesundheit', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-400', emoji: '💪' },
};

const difficultyConfig = {
  easy: { label: 'Einfach', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', dot: '🟢' },
  medium: { label: 'Mittel', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', dot: '🟡' },
  hard: { label: 'Schwer', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', dot: '🔴' },
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
    if (onComplete) onComplete({ ...result, memberName: member.name });
  };

  const eligibleMembers = quest.assigneeId
    ? members.filter((m) => m.id === quest.assigneeId)
    : members;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!quest.completed ? { y: -1 } : {}}
      className={`card p-4 relative overflow-hidden transition-all ${
        quest.completed ? 'opacity-60' : ''
      } ${isOverdue ? 'ring-1 ring-red-200' : ''}`}
    >
      {/* Category accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${catConfig.bar}`} />

      <div className="pl-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-bold text-base ${quest.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {quest.title}
              </h3>
              {quest.completed && <CheckCircle size={15} className="text-emerald-500 shrink-0" />}
            </div>
            {quest.description && (
              <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{quest.description}</p>
            )}
          </div>

          {/* XP Badge */}
          <div className="shrink-0">
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap size={11} className="text-amber-500" />
              {quest.xpReward} XP
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${catConfig.bg} ${catConfig.border} ${catConfig.text}`}>
            {catConfig.emoji} {catConfig.label}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${diffConfig.bg} ${diffConfig.border} ${diffConfig.text}`}>
            {diffConfig.dot} {diffConfig.label}
          </span>
          {quest.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              <Clock size={10} />
              {isOverdue ? 'Überfällig!' : `Fällig ${new Date(quest.dueDate).toLocaleDateString('de-DE')}`}
            </span>
          )}
        </div>

        {/* Assignee / Complete row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {quest.completed && completedByMember ? (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {completedByMember.avatarType === 'photo' ? (
                    <img src={completedByMember.avatar} alt={completedByMember.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{completedByMember.avatar}</span>
                  )}
                </div>
                <span className="font-medium">{completedByMember.name}</span>
              </div>
            ) : assignee ? (
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {assignee.avatarType === 'photo' ? (
                    <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{assignee.avatar}</span>
                  )}
                </div>
                <span>{assignee.name}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-xs">Für alle</span>
            )}
          </div>

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
              <CheckCircle size={13} />
              Erledigt!
            </motion.button>
          )}
        </div>

        {/* Member selection */}
        <AnimatePresence>
          {showMemberSelect && !quest.completed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Wer hat das erledigt?</p>
                <div className="flex flex-wrap gap-2">
                  {eligibleMembers.map((member) => (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleComplete(member.id)}
                      className="flex items-center gap-2 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-xl px-3 py-2 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {member.avatarType === 'photo' ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">{member.avatar}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{member.name}</span>
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
