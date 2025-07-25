'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
  gestures: ['👍', '👎', '👌', '🤞', '✌️', '🤟', '🤘', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦵'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💔', '❣️'],
  objects: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭', '🍪', '🍩', '🍯', '🍓', '🍒', '🍑', '🥝', '🍍', '🥥']
};

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 w-80"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Choose an emoji</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-all"
            >
              <span className="text-white/60 text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
              className={`flex-1 p-3 text-center transition-all ${
                activeCategory === category
                  ? 'bg-white/20 text-white border-b-2 border-blue-400'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="text-sm font-medium capitalize">{category}</span>
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
              <motion.button
                key={`${activeCategory}-${index}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all text-xl"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 text-center">
          <span className="text-white/40 text-xs">Click an emoji to add it to your message</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
