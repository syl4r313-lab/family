import { motion } from 'framer-motion';
import { xpForNextLevel } from '../store/useFamilyStore';

interface XPBarProps {
  xp: number;
  level: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export default function XPBar({
  xp,
  level,
  showLabel = true,
  height = 'md',
  animated = true,
}: XPBarProps) {
  const currentLevelXP = xpForNextLevel(level - 1);
  const nextLevelXP = xpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 font-medium">{xp.toLocaleString()} XP</span>
          <span className="text-xs text-gray-400">Lv.{level + 1} bei {nextLevelXP.toLocaleString()} XP</span>
        </div>
      )}

      <div className={`w-full bg-gray-100 rounded-full ${heightMap[height]} overflow-hidden`}>
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}
