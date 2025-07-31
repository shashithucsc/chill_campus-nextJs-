'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon,
  FlagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onReportSubmitted: () => void;
}

const REPORT_REASONS = [
  'Inappropriate Content',
  'Harassment', 
  'Spam',
  'Misinformation',
  'Violence',
  'Hate Speech',
  'Copyright Violation',
  'Other'
];

export default function ReportModal({ isOpen, onClose, postId, onReportSubmitted }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Also prevent scrolling on the document element
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason || !description.trim()) {
      setError('Please select a reason and provide description');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('Submitting report:', { postId, reason: selectedReason, description: description.trim() });
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          reason: selectedReason,
          description: description.trim()
        }),
      });

      console.log('Report response status:', response.status);
      console.log('Report response headers:', response.headers.get('content-type'));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received');
        const textResponse = await response.text();
        console.error('Response text:', textResponse.substring(0, 500));
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();
      console.log('Report response:', { status: response.status, data });

      if (response.ok) {
        onReportSubmitted();
        onClose();
        // Reset form
        setSelectedReason('');
        setDescription('');
      } else {
        setError(data.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError('');
      setSelectedReason('');
      setDescription('');
    }
  };

  // Don't render until mounted (for SSR compatibility)
  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            margin: 0,
            transform: 'none',
            zIndex: 99999,
            width: '100vw',
            height: '100vh'
          }}
        >
          {/* Full viewport backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={handleClose} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%'
            }}
          />
          
          {/* Centered modal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-[100000] w-full max-w-lg bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-h-[85vh] overflow-hidden"
            style={{ 
              margin: 'auto',
              transform: 'none',
              position: 'relative',
              zIndex: 100000
            }}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[85vh]">
                <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <FlagIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Report Post</h3>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason Selection */}
                <div>
                  <label className="block text-white/90 font-medium mb-4">
                    Why are you reporting this post?
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {REPORT_REASONS.map((reason) => (
                      <label key={reason} className="flex items-start space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          disabled={isSubmitting}
                          className="mt-1 w-4 h-4 text-red-500 bg-white/10 border-white/30 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <span className="text-white/80 group-hover:text-white transition-colors leading-relaxed">
                          {reason}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/90 font-medium mb-3">
                    Additional details
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide more details about why you're reporting this post..."
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none transition-all"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-all disabled:opacity-50 order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedReason || !description.trim()}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>
                </div>
              </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal at document.body level to avoid positioning issues
  return typeof window !== 'undefined' && document.body 
    ? createPortal(modalContent, document.body)
    : null;
}
