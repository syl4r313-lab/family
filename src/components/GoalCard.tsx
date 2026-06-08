import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Euro } from 'lucide-react';
import type { FamilyGoal } from '../types';

interface GoalCardProps {
  goal: FamilyGoal;
  onContribute?: () => void;
}

const goalTypeConfig = {
  vacation: { label: 'Urlaub', emoji: '✈️', bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', bar: 'from-sky-400 to-sky-500' },
  savings: { label: 'Sparziel', emoji: '💰', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', bar: 'from-emerald-400 to-emerald-500' },
  purchase: { label: 'Kauf', emoji: '🛒', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', bar: 'from-amber-400 to-amber-500' },
  project: { label: 'Projekt', emoji: '🔨', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', bar: 'from-violet-400 to-violet-500' },
  challenge: { label: 'Challenge', emoji: '🏆', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', bar: 'from-orange-400 to-orange-500' },
};

function formatEuro(amount: number): string {
  return amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthsUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return diff;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function formatCountdown(dateStr: string): string {
  const months = monthsUntil(dateStr);
  const days = daysUntil(dateStr);
  if (days <= 0) return 'Heute!';
  if (days < 30) return `noch ${days} Tage`;
  if (months === 1) return 'noch 1 Monat';
  return `noch ${months} Monate`;
}

export default function GoalCard({ goal, onContribute }: GoalCardProps) {
  const progress = goal.targetAmount > 0
    ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
    : 0;
  const config = goalTypeConfig[goal.type] ?? goalTypeConfig.challenge;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className="card p-5 relative overflow-hidden"
    >
      {/* Top section */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center text-3xl shrink-0`}>
          {goal.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base">{goal.title}</h3>
            {goal.completed && (
              <CheckCircle size={16} className="text-emerald-500" />
            )}
          </div>
          {goal.description && (
            <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{goal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${config.bg} ${config.border} ${config.text}`}>
              {config.emoji} {config.label}
            </span>
            {goal.targetDate && !goal.completed && (
              <span className={`text-xs flex items-center gap-1 ${daysUntil(goal.targetDate) < 30 ? 'text-red-500' : 'text-gray-400'}`}>
                <Calendar size={11} />
                {formatCountdown(goal.targetDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Money progress */}
      <div className="mt-4">
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <span className="text-2xl font-black text-gray-900">€ {formatEuro(goal.currentAmount)}</span>
            <span className="text-sm text-gray-400 ml-1">von € {formatEuro(goal.targetAmount)}</span>
          </div>
          <span className="text-sm font-semibold text-gray-500">{Math.round(progress)}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${config.bar} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
          />
        </div>

        {!goal.completed && (
          <p className="text-xs text-gray-400 mt-1">
            Noch € {formatEuro(goal.targetAmount - goal.currentAmount)} bis zum Ziel
          </p>
        )}
      </div>

      {/* XP bonus info */}
      {goal.xpBonusOnComplete > 0 && !goal.completed && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100 w-fit">
          <span>⚡</span>
          <span className="font-medium">+{goal.xpBonusOnComplete} XP bei Abschluss</span>
        </div>
      )}

      {/* Action */}
      {!goal.completed && onContribute && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContribute}
          className="mt-4 w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
        >
          <Euro size={14} />
          Geld einzahlen
        </motion.button>
      )}

      {goal.completed && (
        <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl py-2.5 text-center">
          <span className="text-emerald-600 font-bold text-sm">🎉 Ziel erreicht!</span>
        </div>
      )}

      {/* Recent contributions */}
      {goal.contributions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-2">Letzte Einzahlungen</p>
          <div className="space-y-1">
            {goal.contributions.slice(-3).reverse().map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{c.note || 'Einzahlung'}</span>
                <span className="font-semibold text-emerald-600">+€ {formatEuro(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
