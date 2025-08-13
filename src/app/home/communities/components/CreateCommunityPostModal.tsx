import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, VideoCameraIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface CreateCommunityPostModalProps {
  open?: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  communityId: string;
  communityName: string;
}

export default function CreateCommunityPostModal({ 
  open = true, 
  onClose, 
  onPostCreated, 
  communityId, 
  communityName 
}: CreateCommunityPostModalProps) {
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
      
      const res = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
        setLoading(false);
        return;
      }
      
      // Reset form
      setContent('');
      setMedia(null);
      setMediaType(null);
      setLoading(false);
      
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      console.error('Error creating community post:', err);
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
          onClick={handleBackdropClick}
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            
            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-slate-800/95 via-purple-800/95 to-indigo-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Create Post
                  </h2>
                  <p className="text-white/70 mt-1">
                    Posting in <span className="text-blue-300 font-medium">{communityName}</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6 text-white/80" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Content textarea */}
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's happening in your community?"
                    className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    maxLength={500}
                  />
                  <div className="text-right mt-2">
                    <span className="text-white/50 text-sm">{content.length}/500</span>
                  </div>
                </div>

                {/* Media upload */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 p-3 border border-white/20 rounded-xl transition-colors duration-200 text-white"
                        style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
                      >
                        <PhotoIcon className="h-5 w-5 text-white" />
                        <span className="text-white font-medium">Add Photo</span>
                      </motion.div>
                    </label>
                    
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 p-3 border border-white/20 rounded-xl transition-colors duration-200 text-white"
                        style={{background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 50%, #0f0f23 100%)'}}
                      >
                        <VideoCameraIcon className="h-5 w-5 text-white" />
                        <span className="text-white font-medium">Add Video</span>
                      </motion.div>
                    </label>
                  </div>

                  {/* Media preview */}
                  {media && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative bg-white/10 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {mediaType === 'image' ? (
                            <PhotoIcon className="h-8 w-8 text-blue-300" />
                          ) : (
                            <VideoCameraIcon className="h-8 w-8 text-purple-300" />
                          )}
                          <div>
                            <p className="text-white font-medium">{media.name}</p>
                            <p className="text-white/60 text-sm">
                              {(media.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setMedia(null);
                            setMediaType(null);
                          }}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
                        >
                          <XMarkIcon className="h-5 w-5 text-white/80" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                  >
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    disabled={loading || (!content.trim() && !media)}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="flex-1 py-3 px-6 text-white font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2 rounded-xl border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={loading ? undefined : {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                    {loading ? 'Posting...' : 'Post'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
