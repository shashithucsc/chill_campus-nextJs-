'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ParticlesBackground() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render particles on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    // Return empty div during SSR
    return <div className="absolute inset-0 z-10 pointer-events-none"></div>;
  }
  
  // These positions are fixed and won't change between server and client
  const particles = [
    { left: 16.9, top: 56.2, delay: 0.48 },
    { left: 49.7, top: 46.2, delay: 1.37 },
    { left: 44.5, top: 82.5, delay: 0.53 },
    { left: 73.8, top: 78.8, delay: 1.16 },
    { left: 30.0, top: 21.5, delay: 0.45 },
    { left: 76.1, top: 17.8, delay: 1.23 },
    { left: 22.3, top: 37.4, delay: 0.49 },
    { left: 77.4, top: 4.1, delay: 0.81 },
  ];

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay
          }}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`
          }}
        />
      ))}
    </div>
  );
}
