import { motion } from 'motion/react';

export function AnimatedBackground() {
  const orbs = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 30,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-sm"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${
              Math.random() > 0.5 
                ? 'rgba(139, 69, 19, 0.15)' // Hollow Knight orange-brown
                : Math.random() > 0.5 
                ? 'rgba(65, 105, 225, 0.12)' // Silksong blue
                : 'rgba(255, 255, 255, 0.08)' // Pale glow
            }, transparent)`,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.8, 0.4, 0.3],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Additional ambient particles */}
      {Array.from({ length: 25 }, (_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            delay: Math.random() * 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}