'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  XMarkIcon,
  PhotoIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Community {
  _id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'Public' | 'Private';
  coverImage: string;
  tags: string[];
}

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community;
  onUpdate: (updatedCommunity: Community) => void;
}

interface FormData {
  name: string;
  category: string;
  description: string;
  visibility: 'Public' | 'Private';
  coverImage: string;
  tags: string[];
}

interface FormErrors {
  name?: string;
  category?: string;
  description?: string;
  submit?: string;
}

const categories = ['Tech', 'Arts', 'Clubs', 'Events', 'Others'];

export default function EditCommunityModal({ isOpen, onClose, community, onUpdate }: EditCommunityModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    visibility: 'Public',
    coverImage: '',
    tags: []
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Initialize form data when community changes
  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name,
        category: community.category,
        description: community.description,
        visibility: community.visibility,
        coverImage: community.coverImage,
        tags: community.tags || []
      });
      setImagePreview(community.coverImage || '');
    }
  }, [community]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setShowSuccess(false);
      setTagInput('');
      setImageFile(null);
    }
  }, [isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous errors
    setErrors(prev => ({ ...prev, submit: '' }));

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        submit: 'Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed.'
      }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        submit: 'File size too large. Maximum size is 5MB.'
      }));
      return;
    }

    try {
      setIsImageUploading(true);
      
      // Show preview immediately for better UX
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);

      // Create FormData for upload
      const uploadData = new FormData();
      uploadData.append('file', file);

      // Upload the image
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
        credentials: 'include'
      });

      const response = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(response.message || 'Failed to upload image');
      }

      // Update form data with the new image URL
      setFormData(prev => ({ ...prev, coverImage: response.url }));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to upload image'
      }));
      
      // Clear preview on error
      setImagePreview(community.coverImage || '');
      setImageFile(null);
      setFormData(prev => ({ ...prev, coverImage: community.coverImage }));
    } finally {
      setIsImageUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag) && formData.tags.length < 5) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Community name must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/communities/${community._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          description: formData.description.trim(),
          visibility: formData.visibility,
          coverImage: formData.coverImage,
          tags: formData.tags
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update community');
      }

      const data = await response.json();
      
      // Show success message
      setShowSuccess(true);
      
      // Update parent component
      onUpdate(data.community);
      
      // Close modal after a delay
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        submit: err.message || 'Failed to update community'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Edit Community
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-white/70" />
            </motion.button>
          </div>

          {/* Success State */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border-b border-white/10"
            >
              <div className="flex items-center justify-center space-x-3 text-green-400">
                <CheckCircleIcon className="h-6 w-6" />
                <span className="font-medium">Community updated successfully!</span>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Community Name */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Community Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Enter community name"
                  disabled={isLoading}
                />
                <UserGroupIcon className="absolute right-3 top-3 h-5 w-5 text-white/40" />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                disabled={isLoading}
              >
                <option value="" disabled className="bg-gray-900">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-gray-900">
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-400 text-sm flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                placeholder="Describe your community..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-400 text-sm flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Community Cover Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  disabled={isLoading || isImageUploading}
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full h-32 px-4 bg-white/10 backdrop-blur-md border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/20 transition-all duration-300"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeImage();
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                      >
                        <XMarkIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      {isImageUploading ? (
                        <ArrowPathIcon className="mx-auto h-8 w-8 text-white/40 animate-spin" />
                      ) : (
                        <>
                          <PhotoIcon className="mx-auto h-8 w-8 text-white/40" />
                          <p className="mt-2 text-sm text-white/60">
                            Click to upload cover image
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Visibility
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: 'Public' })}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border ${
                    formData.visibility === 'Public'
                      ? 'text-white border border-white/20'
                      : 'bg-white/10 border-white/20'
                  } backdrop-blur-md transition-all duration-300`}
                  style={formData.visibility === 'Public' ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
                  disabled={isLoading}
                >
                  <GlobeAltIcon className="h-5 w-5 mr-2 text-white/70" />
                  <span className="text-white">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: 'Private' })}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border ${
                    formData.visibility === 'Private'
                      ? 'text-white border border-white/20'
                      : 'bg-white/10 border-white/20'
                  } backdrop-blur-md transition-all duration-300`}
                  style={formData.visibility === 'Private' ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
                  disabled={isLoading}
                >
                  <LockClosedIcon className="h-5 w-5 mr-2 text-white/70" />
                  <span className="text-white">Private</span>
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter (max 5 tags)"
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                disabled={isLoading || formData.tags.length >= 5}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 border border-white/30 rounded-full text-sm text-white flex items-center"
                      style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-300 transition-colors"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
                <p className="text-red-300 text-sm flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium border border-white/20 transition-all duration-300"
                disabled={isLoading}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || isImageUploading}
                className="flex-1 px-6 py-3 text-white rounded-xl font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Updating...
                  </div>
                ) : (
                  'Update Community'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
