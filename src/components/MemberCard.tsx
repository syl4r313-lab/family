import { motion } from 'framer-motion';
import { Flame, Trophy, Zap } from 'lucide-react';
import type { FamilyMember } from '../types';
import XPBar from './XPBar';

interface MemberCardProps {
  member: FamilyMember;
  rank?: number;
  compact?: boolean;
  onClick?: () => void;
}

const rankEmojis = ['🥇', '🥈', '🥉'];

function AvatarDisplay({ member, size }: { member: FamilyMember; size: 'sm' | 'lg' }) {
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
  const textSize = size === 'sm' ? 'text-xl' : 'text-4xl';
  return (
    <div className={`${dim} rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center shrink-0`}>
      {member.avatarType === 'photo' ? (
        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
      ) : (
        <span className={textSize}>{member.avatar}</span>
      )}
    </div>
  );
}

export default function MemberCard({ member, rank, compact = false, onClick }: MemberCardProps) {
  if (compact) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="card p-3 cursor-pointer hover:shadow-card-hover transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <AvatarDisplay member={member} size="sm" />
            {member.streak > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-orange-100 border border-orange-200 rounded-full w-4 h-4 flex items-center justify-center">
                <span className="text-xs">🔥</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 truncate">{member.name}</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                Lv.{member.level}
              </span>
            </div>
            <XPBar xp={member.xp} level={member.level} showLabel={false} height="sm" animated={false} />
          </div>
          <div className="text-right shrink-0">
            <div className="text-amber-500 font-bold text-sm">{member.xp.toLocaleString()}</div>
            <div className="text-gray-400 text-xs">XP</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="card p-5 cursor-pointer relative overflow-hidden hover:shadow-card-hover transition-shadow"
    >
      {/* Rank indicator */}
      {rank !== undefined && rank < 3 && (
        <div className="absolute top-3 right-3 text-2xl">{rankEmojis[rank]}</div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <AvatarDisplay member={member} size="lg" />
          {member.streak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-orange-50 border border-orange-200 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
              <Flame size={9} className="text-orange-500" />
              <span className="text-orange-600 text-xs font-bold">{member.streak}</span>
            </div>
          )}
        </div>

        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
              member.role === 'parent'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {member.role === 'parent' ? '👑 Elternteil' : '⭐ Kind'}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              Level {member.level}
            </span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-4">
        <XPBar xp={member.xp} level={member.level} height="md" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-amber-50 rounded-xl p-2 text-center border border-amber-100">
          <div className="flex items-center justify-center gap-1 text-amber-500">
            <Zap size={11} />
            <span className="font-bold text-sm">{member.xp.toLocaleString()}</span>
          </div>
          <div className="text-gray-500 text-xs mt-0.5">XP</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-2 text-center border border-emerald-100">
          <div className="flex items-center justify-center gap-1 text-emerald-600">
            <Trophy size={11} />
            <span className="font-bold text-sm">{member.completedQuests}</span>
          </div>
          <div className="text-gray-500 text-xs mt-0.5">Quests</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-2 text-center border border-orange-100">
          <div className="flex items-center justify-center gap-1 text-orange-500">
            <Flame size={11} />
            <span className="font-bold text-sm">{member.streak}</span>
          </div>
          <div className="text-gray-500 text-xs mt-0.5">Streak</div>
        </div>
      </div>

      {/* Badges */}
      {member.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {member.badges.slice(0, 6).map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.2 }}
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
  );
}
