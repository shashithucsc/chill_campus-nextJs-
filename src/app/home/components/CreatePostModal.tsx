import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, VideoCameraIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface CreatePostModalProps {
  open?: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  children?: React.ReactNode; // For rendering existing posts in background
}

export default function CreatePostModal({ open = true, onClose, onPostCreated, children }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
      const type = e.target.files[0].type.startsWith('video') ? 'video' : 'image';
      setMediaType(type);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (media) {
        formData.append('media', media);
        formData.append('mediaType', mediaType || '');
      }
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
        setLoading(false);
        return;
      }
      setContent('');
      setMedia(null);
      setMediaType(null);
      setLoading(false);
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      setError('Failed to create post');
      setLoading(false);
    }
  };

  if (!open) return null;
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] overflow-y-auto"
        >
          {/* Background with existing posts (blurred) */}
          <div className="min-h-screen relative">
            {/* Background video */}
            <div className="fixed inset-0 -z-20">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95"></div>
            </div>

            {/* Blurred existing posts background */}
            {children && (
              <div className="absolute inset-0 -z-10">
                <div className="blur-lg opacity-30 pointer-events-none">
                  {children}
                </div>
                {/* Additional blur overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              </div>
            )}

            {/* Modal backdrop */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-md -z-5"
              onClick={handleBackdropClick}
            />

            {/* Centered modal container */}
            <div className="relative flex items-center justify-center min-h-screen p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="relative w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-40" />
                
                {/* Main modal container */}
                <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 animate-pulse" />
                  
                  <div className="relative p-8">
                    {/* Close button */}
                    <motion.button
                      onClick={handleClose}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 group z-20"
                      type="button"
                    >
                      <XMarkIcon className="w-6 h-6 text-white group-hover:text-white/90" />
                    </motion.button>

                    {/* Header */}
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mb-8"
                    >
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3">
                        Create Post
                      </h2>
                      <p className="text-white/80 text-lg">Share your thoughts with the community</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Content textarea */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group"
                      >
                        <textarea
                          className="w-full h-36 bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/15 resize-none transition-all duration-300"
                          placeholder="What's on your mind? Share something amazing..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required={!media}
                        />
                        {/* Character counter */}
                        <div className="absolute bottom-3 right-3 text-white/40 text-xs">
                          {content.length}/500
                        </div>
                      </motion.div>

                      {/* Media preview */}
                      <AnimatePresence>
                        {media && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="relative bg-white/10 border border-white/20 rounded-xl p-4 group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white/80 text-sm font-medium flex items-center">
                                {mediaType === 'image' ? (
                                  <PhotoIcon className="w-4 h-4 mr-2" />
                                ) : (
                                  <VideoCameraIcon className="w-4 h-4 mr-2" />
                                )}
                                Media Preview
                              </span>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setMedia(null);
                                  setMediaType(null);
                                }}
                                className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-all"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <div className="rounded-lg overflow-hidden border border-white/10">
                              {mediaType === 'image' ? (
                                <img
                                  src={URL.createObjectURL(media)}
                                  alt="Preview"
                                  className="w-full h-48 object-cover"
                                />
                              ) : (
                                <video
                                  src={URL.createObjectURL(media)}
                                  controls
                                  className="w-full h-48 object-cover"
                                />
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* File upload */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative"
                      >
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="media-upload"
                        />
                        <motion.label
                          htmlFor="media-upload"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center w-full py-4 px-4 bg-white/10 border border-white/20 border-dashed rounded-xl text-white/80 hover:bg-white/15 hover:border-white/30 transition-all duration-200 cursor-pointer group"
                        >
                          <PhotoIcon className="w-5 h-5 mr-2 group-hover:text-purple-300 transition-colors" />
                          <span className="group-hover:text-white transition-colors">
                            Add Photo or Video
                          </span>
                        </motion.label>
                      </motion.div>

                      {/* Error message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-red-200 text-sm backdrop-blur-sm"
                          >
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse" />
                              {error}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit button */}
                      <motion.button
                        type="submit"
                        disabled={loading || (!content.trim() && !media)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600 hover:from-purple-700 hover:via-pink-700 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl disabled:cursor-not-allowed group"
                      >
                        {/* Button glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-teal-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
                        
                        <div className="relative flex items-center justify-center">
                          {loading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Publishing...</span>
                            </div>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                              <span>Share Post</span>
                            </>
                          )}
                        </div>
                      </motion.button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
