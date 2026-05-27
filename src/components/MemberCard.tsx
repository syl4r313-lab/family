import { motion } from 'framer-motion';
import { Flame, Trophy, Star } from 'lucide-react';
import type { FamilyMember } from '../types';
import XPBar from './XPBar';

interface MemberCardProps {
  member: FamilyMember;
  rank?: number;
  compact?: boolean;
  onClick?: () => void;
}

const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
const rankEmojis = ['🥇', '🥈', '🥉'];

export default function MemberCard({ member, rank, compact = false, onClick }: MemberCardProps) {
  if (compact) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="glass-card p-3 cursor-pointer hover:bg-white/15 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center text-xl">
              {member.avatar}
            </div>
            {member.streak > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center">
                <span className="text-xs">🔥</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white truncate">{member.name}</span>
              <span className="text-xs bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">
                Lv.{member.level}
              </span>
            </div>
            <XPBar xp={member.xp} level={member.level} showLabel={false} height="sm" animated={false} />
          </div>
          <div className="text-right shrink-0">
            <div className="text-yellow-400 font-bold text-sm">{member.xp.toLocaleString()}</div>
            <div className="text-gray-500 text-xs">XP</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-5 cursor-pointer hover:bg-white/15 transition-colors relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />

      {/* Rank indicator */}
      {rank !== undefined && rank < 3 && (
        <div className="absolute top-3 right-3 text-2xl">
          {rankEmojis[rank]}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 flex items-center justify-center text-4xl shadow-glow-purple">
            {member.avatar}
          </div>
          {member.streak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-lg">
              <Flame size={10} className="text-white" />
              <span className="text-white text-xs font-bold">{member.streak}</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{member.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              member.role === 'parent'
                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/30'
                : 'bg-pink-500/30 text-pink-300 border border-pink-500/30'
            }`}>
              {member.role === 'parent' ? '👑 Elternteil' : '⭐ Kind'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
              Level {member.level}
            </span>
            {rank !== undefined && (
              <span className={`text-sm font-bold ${rankColors[rank] || 'text-gray-400'}`}>
                #{rank + 1}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-4">
        <XPBar xp={member.xp} level={member.level} height="md" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-white/5 rounded-xl p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-400">
            <Star size={12} />
            <span className="font-bold text-sm">{member.xp.toLocaleString()}</span>
          </div>
          <div className="text-gray-500 text-xs mt-0.5">XP</div>
        </div>
        <div className="bg-white/5 rounded-xl p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-green-400">
            <Trophy size={12} />
            <span className="font-bold text-sm">{member.completedQuests}</span>
          </div>
          <div className="text-gray-500 text-xs mt-0.5">Quests</div>
        </div>
        <div className="bg-white/5 rounded-xl p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-400">
            <Flame size={12} />
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
              className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/30 flex items-center justify-center text-sm shadow-[0_0_8px_rgba(234,179,8,0.3)] cursor-help"
            >
              {badge.emoji}
            </motion.div>
          ))}
          {member.badges.length > 6 && (
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-gray-400">
              +{member.badges.length - 6}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
