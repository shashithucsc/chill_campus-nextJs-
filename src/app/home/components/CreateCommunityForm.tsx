'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  UserGroupIcon,
  PhotoIcon,
  GlobeAltIcon,
  LockClosedIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  category: string;
  description: string;
  visibility: 'Public' | 'Private';
  imageUrl?: string;
  submit?: string;
}

const categories = ['Tech', 'Arts', 'Clubs', 'Events', 'Others'];

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessPopup = ({ isOpen, onClose, message }: SuccessPopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl border border-white/10 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function CreateCommunityForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    visibility: 'Public'
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'  // Add this to include cookies
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to upload image'
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setErrors(prev => ({
        ...prev,
        submit: 'Please sign in to create a community'
      }));
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile as Blob);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const response = await fetch('/api/communities/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          visibility: formData.visibility,
          imageUrl: imageUrl
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create community');
      }

      await response.json();
      setShowSuccessPopup(true);
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        submit: err.message || 'Something went wrong'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    router.push('/home/communities');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
            >
              Create Community
            </motion.h1>
            <p className="mt-2 text-white/60">
              Build a space for your community to thrive
            </p>
          </div>

          {/* Community Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
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
              />
              <UserGroupIcon className="absolute right-3 top-3 h-5 w-5 text-white/40" />
            </div>
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name}</p>
            )}
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="block text-white/90 text-sm font-medium">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="" disabled className="bg-gray-900">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-gray-900">
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm">{errors.category}</p>
            )}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="block text-white/90 text-sm font-medium">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Describe your community..."
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description}</p>
            )}
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-white/90 text-sm font-medium">
              Community Banner (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="image-upload"
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
                      onClick={() => {
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, imageUrl: '' }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                    >
                      <XMarkIcon className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <PhotoIcon className="mx-auto h-8 w-8 text-white/40" />
                    <p className="mt-2 text-sm text-white/60">
                      Click to upload banner image
                    </p>
                  </div>
                )}
              </label>
            </div>
          </motion.div>

          {/* Visibility Toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <label className="block text-white/90 text-sm font-medium">
              Visibility
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'Public' })}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border ${
                  formData.visibility === 'Public'
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-white/10 border-white/20'
                } backdrop-blur-md transition-all duration-300`}
              >
                <GlobeAltIcon className="h-5 w-5 mr-2 text-white/70" />
                <span className="text-white">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'Private' })}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border ${
                  formData.visibility === 'Private'
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-white/10 border-white/20'
                } backdrop-blur-md transition-all duration-300`}
              >
                <LockClosedIcon className="h-5 w-5 mr-2 text-white/70" />
                <span className="text-white">Private</span>
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-4"
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <ArrowPathIcon className="h-5 w-5 mx-auto animate-spin" />
              ) : (
                'Create Community'
              )}
            </button>
            {errors.submit && (
              <p className="mt-2 text-center text-red-400 text-sm">{errors.submit}</p>
            )}
          </motion.div>
        </form>
      </motion.div>

      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        message="Community created successfully!"
      />
    </>
  );
}
