'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperClipIcon,
  PhotoIcon,
  DocumentIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface FileAttachment {
  url: string;
  originalName: string;
  size: number;
  type: string;
  category: string;
}

interface FileAttachmentComponentProps {
  onFileSelect: (file: FileAttachment) => void;
  onFileRemove: () => void;
  selectedFile?: FileAttachment | null;
  disabled?: boolean;
  className?: string;
}

export default function FileAttachmentComponent({
  onFileSelect,
  onFileRemove,
  selectedFile,
  disabled = false,
  className = ''
}: FileAttachmentComponentProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success && result.file) {
        onFileSelect(result.file);
        setShowOptions(false);
      } else {
        alert(result.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <PhotoIcon className="h-5 w-5" />;
      case 'audio':
        return <SpeakerWaveIcon className="h-5 w-5" />;
      case 'video':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'pdf':
        return <DocumentIcon className="h-5 w-5 text-red-400" />;
      default:
        return <DocumentIcon className="h-5 w-5" />;
    }
  };

  const getAcceptTypes = () => {
    return [
      // Images
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
      // Audio
      '.mp3', '.wav', '.ogg', '.m4a', '.aac',
      // Video
      '.mp4', '.webm', '.mov', '.avi',
      // Documents
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
      // Archives
      '.zip', '.rar'
    ].join(',');
  };

  if (selectedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 ${className}`}
      >
        <div className="flex items-center space-x-2 flex-1">
          <div className="text-blue-400">
            {getFileIcon(selectedFile.category)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {selectedFile.originalName}
            </p>
            <p className="text-xs text-white/60">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        </div>
        
        <button
          onClick={onFileRemove}
          className="p-1 rounded-lg hover:bg-white/10 transition-all text-red-400 hover:text-red-300"
          title="Remove file"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <motion.button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className={`
          p-2 rounded-xl transition-all border border-white/20 hover:bg-white/10
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'}
        `}
        style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}
        title="Attach file"
        whileHover={!disabled && !isUploading ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isUploading ? { scale: 0.95 } : {}}
      >
        {isUploading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        ) : (
          <PaperClipIcon className="h-5 w-5 text-white/70" />
        )}
      </motion.button>

      {isUploading && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap">
            Uploading...
          </div>
        </div>
      )}
    </div>
  );
}
