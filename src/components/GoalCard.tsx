import { motion } from 'framer-motion';
import { Target, Calendar, CheckCircle } from 'lucide-react';
import type { FamilyGoal } from '../types';

interface GoalCardProps {
  goal: FamilyGoal;
  onContribute?: () => void;
}

const goalTypeConfig = {
  vacation: { label: 'Urlaub', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
  savings: { label: 'Sparziel', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20 border-green-500/30 text-green-300' },
  project: { label: 'Projekt', color: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/20 border-purple-500/30 text-purple-300' },
  challenge: { label: 'Challenge', color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/20 border-orange-500/30 text-orange-300' },
};

export default function GoalCard({ goal, onContribute }: GoalCardProps) {
  const progress = Math.min(100, (goal.currentXP / goal.targetXP) * 100);
  const config = goalTypeConfig[goal.type];
  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5 pointer-events-none`} />

      {/* Top section */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl shadow-lg`}>
          {goal.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white text-base">{goal.title}</h3>
            {goal.completed && (
              <CheckCircle size={16} className="text-green-400" />
            )}
          </div>
          <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{goal.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.bg}`}>
              {config.label}
            </span>
            {daysLeft !== null && !goal.completed && (
              <span className={`text-xs flex items-center gap-1 ${daysLeft < 3 ? 'text-red-400' : 'text-gray-500'}`}>
                <Calendar size={11} />
                {daysLeft > 0 ? `${daysLeft} Tage` : 'Heute!'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress section */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Target size={12} />
            Fortschritt
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {goal.currentXP.toLocaleString()}
              <span className="text-gray-500 font-normal"> / {goal.targetXP.toLocaleString()} XP</span>
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${config.color} rounded-full relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="absolute inset-0 shimmer" />
          </motion.div>
        </div>

        <div className="flex justify-between items-center mt-1.5">
          <span className="text-xs text-gray-500">{Math.round(progress)}% abgeschlossen</span>
          {!goal.completed && (
            <span className="text-xs text-gray-500">
              noch {(goal.targetXP - goal.currentXP).toLocaleString()} XP
            </span>
          )}
        </div>
      </div>

      {/* Milestone indicators */}
      <div className="flex gap-2 mt-3">
        {[25, 50, 75, 100].map((milestone) => (
          <div key={milestone} className="flex-1">
            <div className={`h-1 rounded-full ${progress >= milestone ? `bg-gradient-to-r ${config.color}` : 'bg-white/10'}`} />
            <div className={`text-center text-xs mt-1 ${progress >= milestone ? 'text-white/60' : 'text-gray-600'}`}>
              {milestone}%
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      {!goal.completed && onContribute && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContribute}
          className={`mt-4 w-full bg-gradient-to-r ${config.color} text-white font-semibold rounded-xl py-2 text-sm shadow-lg transition-opacity hover:opacity-90`}
        >
          XP beisteuern
        </motion.button>
      )}

      {goal.completed && (
        <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-xl py-2 text-center">
          <span className="text-green-400 font-bold text-sm">🎉 Ziel erreicht!</span>
        </div>
      )}
    </motion.div>
  );
}
