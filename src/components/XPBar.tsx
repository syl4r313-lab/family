import { motion } from 'framer-motion';
import { xpForNextLevel } from '../store/useFamilyStore';

interface XPBarProps {
  xp: number;
  level: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  colorScheme?: 'purple' | 'gold' | 'green' | 'blue';
  animated?: boolean;
}

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorMap = {
  purple: 'from-purple-500 to-blue-500',
  gold: 'from-yellow-500 to-orange-500',
  green: 'from-green-500 to-emerald-400',
  blue: 'from-blue-500 to-cyan-400',
};

const glowMap = {
  purple: 'shadow-glow-purple',
  gold: 'shadow-[0_0_10px_rgba(234,179,8,0.6)]',
  green: 'shadow-glow-green',
  blue: 'shadow-glow-blue',
};

export default function XPBar({
  xp,
  level,
  showLabel = true,
  height = 'md',
  colorScheme = 'purple',
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
          <span className="text-xs text-gray-400 font-medium">
            {xp.toLocaleString()} XP
          </span>
          <span className="text-xs text-gray-500">
            Lv.{level + 1} bei {nextLevelXP.toLocaleString()} XP
          </span>
        </div>
      )}

      <div className={`w-full bg-white/10 rounded-full ${heightMap[height]} overflow-hidden`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colorMap[colorScheme]} rounded-full ${glowMap[colorScheme]} relative overflow-hidden`}
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer" />
        </motion.div>
      </div>
    </div>
  );
}
