import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpModalProps {
  visible: boolean;
  memberName: string;
  memberAvatar: string;
  newLevel: number;
  xpGained: number;
  onClose: () => void;
}

export default function LevelUpModal({
  visible,
  memberName,
  memberAvatar,
  newLevel,
  xpGained,
  onClose,
}: LevelUpModalProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Rays background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-[60vh] w-2 bg-gradient-to-t from-transparent via-purple-500/20 to-transparent rounded-full origin-bottom"
                style={{ rotate: i * 30 }}
                animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 2, delay: i * 0.05, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Modal card */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative z-10 text-center px-8 py-10 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-pink-600/30 blur-xl" />
            <div className="relative glass-card p-8">
              {/* Level up text */}
              <motion.div
                animate={{
                  textShadow: [
                    '0 0 20px rgba(139,92,246,0.8)',
                    '0 0 40px rgba(59,130,246,0.9)',
                    '0 0 20px rgba(236,72,153,0.8)',
                    '0 0 40px rgba(139,92,246,0.9)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 mb-2"
              >
                LEVEL UP!
              </motion.div>

              {/* Avatar */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl my-4"
              >
                {memberAvatar}
              </motion.div>

              {/* Name */}
              <div className="text-white font-bold text-xl mb-1">{memberName}</div>
              <div className="text-gray-400 text-sm mb-4">hat ein neues Level erreicht!</div>

              {/* New level */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-glow-purple mb-4"
              >
                <span className="text-3xl">⚡</span>
                <div>
                  <div className="text-xs opacity-80">Neues Level</div>
                  <div className="text-3xl font-black">{newLevel}</div>
                </div>
                <span className="text-3xl">⚡</span>
              </motion.div>

              {/* XP gained */}
              <div className="text-yellow-400 font-bold text-lg">
                +{xpGained} XP verdient! 🌟
              </div>

              {/* Dismiss hint */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-600 text-xs mt-4"
              >
                Tippen zum Schließen
              </motion.div>

              {/* Floating stars */}
              {['✨', '⭐', '🌟', '💫', '✨'].map((star, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl pointer-events-none"
                  style={{
                    top: `${10 + i * 15}%`,
                    left: i % 2 === 0 ? '-5%' : '95%',
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    x: [0, i % 2 === 0 ? 5 : -5, 0],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                >
                  {star}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
