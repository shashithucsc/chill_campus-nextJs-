'use client';

import { useSocket } from '@/contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStatusProps {
  className?: string;
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const { isConnected } = useSocket();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`fixed top-4 right-4 z-50 ${className}`}
      >
        <div className={`
          flex items-center space-x-2 px-3 py-2 rounded-full backdrop-blur-md border
          ${isConnected 
            ? 'bg-green-500/20 border-green-500/30 text-green-300' 
            : 'bg-red-500/20 border-red-500/30 text-red-300'
          }
        `}>
          <motion.div
            animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
          />
          <span className="text-sm font-medium">
            {isConnected ? 'Real-time connected' : 'Reconnecting...'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
