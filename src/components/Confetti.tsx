import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = [
  '#a855f7', '#3b82f6', '#ec4899', '#f59e0b',
  '#10b981', '#f97316', '#06b6d4', '#8b5cf6',
  '#ef4444', '#22c55e', '#eab308', '#6366f1',
];

const SHAPES = ['circle', 'square', 'triangle'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  delay: number;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: Math.random() * 10 + 6,
    vx: (Math.random() - 0.5) * 200,
    vy: -(Math.random() * 300 + 100),
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 720,
    opacity: 1,
    delay: Math.random() * 0.3,
  }));
}

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const particles = useRef(createParticles(60));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) {
      particles.current = createParticles(60);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onComplete?.();
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}vw`,
            y: `${p.y}vh`,
            opacity: 1,
            rotate: p.rotation,
            scale: 1,
          }}
          animate={{
            x: `${p.x + p.vx * 0.1}vw`,
            y: '110vh',
            opacity: 0,
            rotate: p.rotation + p.rotationSpeed,
            scale: 0.3,
          }}
          transition={{
            duration: 2.5,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'fixed',
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'triangle' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : 0,
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined,
            boxShadow: p.shape !== 'triangle' ? `0 0 6px ${p.color}` : undefined,
          }}
        />
      ))}
    </div>
  );
}
