'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  DocumentIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  // VideoCameraIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface FileMessageProps {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  messageType: 'image' | 'audio' | 'video' | 'file' | 'pdf';
  isOwnMessage?: boolean;
  onDelete?: () => void;
  className?: string;
}

export default function FileMessage({
  fileUrl,
  fileName,
  fileSize,
  fileType,
  messageType,
  isOwnMessage = false,
  onDelete,
  className = ''
}: FileMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAudioToggle = () => {
    const audio = document.getElementById(`audio-${fileUrl}`) as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderImageContent = () => (
    <div className="relative group">
      <div 
        className="relative rounded-lg overflow-hidden cursor-pointer max-w-xs"
        onClick={() => setShowFullImage(true)}
      >
        <Image
          src={fileUrl}
          alt={fileName}
          width={300}
          height={200}
          className="object-cover hover:scale-105 transition-transform"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          <PhotoIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>
      
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={fileUrl}
              alt={fileName}
              width={800}
              height={600}
              className="object-contain max-w-full max-h-full"
              unoptimized
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAudioContent = () => (
    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 min-w-[250px]">
      <button
        onClick={handleAudioToggle}
        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-all"
      >
        {isPlaying ? (
          <PauseIcon className="h-5 w-5 text-white" />
        ) : (
          <PlayIcon className="h-5 w-5 text-white" />
        )}
      </button>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-white truncate">{fileName}</p>
        {fileSize && (
          <p className="text-xs text-white/60">{formatFileSize(fileSize)}</p>
        )}
      </div>
      
      <SpeakerWaveIcon className="h-5 w-5 text-blue-400" />
      
      <audio
        id={`audio-${fileUrl}`}
        src={fileUrl}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );

  const renderVideoContent = () => (
    <div className="relative rounded-lg overflow-hidden max-w-md">
      <video
        src={fileUrl}
        controls
        className="w-full h-auto max-h-60"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );

  const renderFileContent = () => {
    const getFileIcon = () => {
      if (messageType === 'pdf') {
        return <DocumentIcon className="h-8 w-8 text-red-400" />;
      }
      return <DocumentIcon className="h-8 w-8 text-blue-400" />;
    };

    return (
      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 min-w-[200px] max-w-xs">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{fileName}</p>
          {fileSize && (
            <p className="text-xs text-white/60">{formatFileSize(fileSize)}</p>
          )}
          {fileType && (
            <p className="text-xs text-white/50 uppercase">{fileType}</p>
          )}
        </div>
        
        <button
          onClick={handleDownload}
          className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/70 hover:text-white"
          title="Download file"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (messageType) {
      case 'image':
        return renderImageContent();
      case 'audio':
        return renderAudioContent();
      case 'video':
        return renderVideoContent();
      case 'file':
      case 'pdf':
      default:
        return renderFileContent();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group ${className}`}
    >
      {renderContent()}
      
      {/* Delete button for own messages */}
      {isOwnMessage && onDelete && (
        <button
          onClick={onDelete}
          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
          title="Delete file"
        >
          <TrashIcon className="h-3 w-3 text-white" />
        </button>
      )}
    </motion.div>
  );
}
