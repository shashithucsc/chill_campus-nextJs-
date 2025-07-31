'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ show, message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-[10001] max-w-sm"
        >
          <div className={`
            bg-gradient-to-r backdrop-blur-xl rounded-xl shadow-2xl border p-4 pr-12
            ${type === 'success' 
              ? 'from-green-900/95 to-emerald-900/95 border-green-500/30 text-green-100' 
              : 'from-red-900/95 to-red-800/95 border-red-500/30 text-red-100'
            }
          `}>
            <div className="flex items-center space-x-3">
              <div className={`
                p-1 rounded-full
                ${type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}
              `}>
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <p className="font-medium">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
