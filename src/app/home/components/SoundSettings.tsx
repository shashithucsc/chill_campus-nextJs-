'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundManager } from '@/lib/SoundManager';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SoundSettings({ isOpen, onClose }: SoundSettingsProps) {
  const { soundManager, isEnabled, volume, toggleSound, updateVolume, playTest } = useSoundManager();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updateVolume(newVolume);
  };

  const testSounds = [
    { name: 'New Message', action: () => soundManager.playNewMessageSound() },
    { name: 'Direct Message', action: () => soundManager.playDirectMessageSound() },
    { name: 'Connection', action: () => soundManager.playConnectSound() },
    { name: 'Success', action: () => soundManager.playSuccessSound() },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 w-96 max-w-[90vw]">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <SpeakerWaveIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Sound Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Sound Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {isEnabled ? (
                      <SpeakerWaveIcon className="h-6 w-6 text-green-400" />
                    ) : (
                      <SpeakerXMarkIcon className="h-6 w-6 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-white font-medium">Sound Notifications</h3>
                      <p className="text-gray-400 text-sm">
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${isEnabled ? 'bg-green-600' : 'bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>

              {/* Volume Control */}
              {isEnabled && (
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">
                    Volume: {Math.round(volume * 100)}%
                  </label>
                  <div className="flex items-center space-x-3">
                    <SpeakerXMarkIcon className="h-4 w-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                      }}
                    />
                    <SpeakerWaveIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Test Sounds */}
              {isEnabled && (
                <div className="mb-6">
                  <h3 className="text-white font-medium mb-3">Test Sounds</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {testSounds.map((sound, index) => (
                      <button
                        key={index}
                        onClick={sound.action}
                        className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 text-sm transition-colors"
                      >
                        {sound.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 Sound notifications help you stay updated with new messages and important events in real-time.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
