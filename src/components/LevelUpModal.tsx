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

  // Check if avatar is a photo (base64)
  const isPhoto = memberAvatar.startsWith('data:');

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
          <div className="absolute inset-0 bg-black/50" />

          {/* Animated rays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-[60vh] w-2 bg-gradient-to-t from-transparent via-emerald-400/20 to-transparent rounded-full origin-bottom"
                style={{ rotate: i * 45 }}
                animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 2, delay: i * 0.08, repeat: Infinity }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative z-10 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-emerald-100">
              {/* Level up text */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl font-black text-gradient-mint mb-3"
              >
                LEVEL UP!
              </motion.div>

              {/* Avatar */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="my-4 flex justify-center"
              >
                {isPhoto ? (
                  <img
                    src={memberAvatar}
                    alt={memberName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center text-5xl shadow-lg">
                    {memberAvatar}
                  </div>
                )}
              </motion.div>

              <div className="text-gray-900 font-bold text-xl mb-1">{memberName}</div>
              <div className="text-gray-500 text-sm mb-5">hat ein neues Level erreicht!</div>

              {/* New level badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg mb-4"
              >
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="text-xs opacity-80">Neues Level</div>
                  <div className="text-3xl font-black">{newLevel}</div>
                </div>
                <span className="text-2xl">⚡</span>
              </motion.div>

              <div className="text-amber-500 font-bold text-lg">+{xpGained} XP verdient! 🌟</div>

              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-400 text-xs mt-4"
              >
                Tippen zum Schließen
              </motion.div>

              {/* Floating stars */}
              {['✨', '⭐', '🌟', '💫', '✨'].map((star, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl pointer-events-none"
                  style={{ top: `${10 + i * 15}%`, left: i % 2 === 0 ? '-5%' : '95%' }}
                  animate={{ y: [-8, 8, -8], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
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
