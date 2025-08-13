'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  particleCount?: number;
  glassParticleCount?: number;
  className?: string;
}

export default function AnimatedBackground({ 
  particleCount = 10, 
  glassParticleCount = 15,
  className = "absolute inset-0"
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Array<{left: number, top: number, delay: number}>>([]);
  const [glassParticles, setGlassParticles] = useState<Array<{left: number, top: number, delay: number}>>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Only generate random positions after component has mounted on client
  useEffect(() => {
    setIsClient(true);
    
    // Generate large particles
    const newParticles = Array.from({ length: particleCount }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4
    }));
    
    // Generate small glass particles
    const newGlassParticles = Array.from({ length: glassParticleCount }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3
    }));
    
    setParticles(newParticles);
    setGlassParticles(newGlassParticles);
  }, [particleCount, glassParticleCount]);

  if (!isClient) {
    return <div className={className}></div>;
  }

  return (
    <div className={className}>
      {/* Gradient blobs */}
      {particles.map((particle, i) => (
        <motion.div
          key={`blob-${i}`}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.25, 0.1, 0.25, 1],
            delay: particle.delay
          }}
          className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
        />
      ))}
      
      {/* Glass particles */}
      {glassParticles.map((particle, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{
            y: [-15, 15, -15],
            x: [-8, 8, -8],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay
          }}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
        />
      ))}
    </div>
  );
}
