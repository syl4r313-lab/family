import { motion } from 'framer-motion';
import type { Page } from '../App';

interface NavItem {
  id: Page;
  label: string;
  emoji: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Start', emoji: '🏠' },
  { id: 'quests', label: 'Quests', emoji: '⚔️' },
  { id: 'members', label: 'Familie', emoji: '👨‍👩‍👧‍👦' },
  { id: 'goals', label: 'Ziele', emoji: '🎯' },
  { id: 'shop', label: 'Shop', emoji: '🛍️' },
];

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass backdrop */}
      <div className="bg-gray-950/80 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-stretch justify-around max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center py-3 px-2 flex-1 relative"
                whileTap={{ scale: 0.9 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-1 top-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                <motion.span
                  className="text-2xl mb-0.5"
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    filter: isActive
                      ? 'drop-shadow(0 0 8px rgba(139,92,246,0.8))'
                      : 'none',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.emoji}
                </motion.span>

                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-purple-400'
                      : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
