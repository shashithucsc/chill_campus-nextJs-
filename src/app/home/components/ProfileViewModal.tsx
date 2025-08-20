'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  XMarkIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  UsersIcon,
  SparklesIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  UserIcon as UserSolid
} from '@heroicons/react/24/solid';

interface UserStats {
  posts: number;
  communities: number;
  followers?: number;
  following?: number;
}

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  bio?: string;
  university?: string;
  role: string;
  interests?: string[];
  joinedAt: string;
  stats: UserStats;
  isFollowing?: boolean;
  mutualConnections?: number;
}

interface ProfileViewModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

export default function ProfileViewModal({ 
  userId, 
  isOpen, 
  onClose, 
  onStartChat 
}: ProfileViewModalProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.user);
      setIsFollowing(data.user.isFollowing || false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!profile || followLoading) return;
    
    setFollowLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update follower count
        if (profile.stats.followers !== undefined) {
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              followers: (prev.stats.followers || 0) + (isFollowing ? -1 : 1)
            }
          } : null);
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle start chat
  const handleStartChat = () => {
    if (profile) {
      onStartChat(profile._id);
      onClose();
    }
  };

  // Load profile when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  // Don't render if not open
  if (!isOpen) return null;

  // Check if viewing own profile
  const isOwnProfile = session?.user?.id === userId;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">User Profile</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mb-4"
              />
              <p className="text-white/60">Loading profile...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <UserIcon className="h-16 w-16 text-white/30 mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Profile Content */}
          {profile && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 bg-gradient-to-br from-blue-500 to-purple-500">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.fullName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserSolid className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Role Badge */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      profile.role === 'admin' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      profile.role === 'moderator' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {profile.role === 'admin' ? '👑 Admin' :
                       profile.role === 'moderator' ? '🛡️ Moderator' :
                       '🎓 Student'}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{profile.fullName}</h3>
                <p className="text-white/60 text-sm mb-2">{profile.email}</p>
                
                {profile.university && (
                  <div className="flex items-center justify-center text-white/70 text-sm mb-4">
                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                    {profile.university}
                  </div>
                )}

                {/* Stats */}
                <div className="flex justify-center space-x-6 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{profile.stats.posts}</div>
                    <div className="text-xs text-white/60">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{profile.stats.communities}</div>
                    <div className="text-xs text-white/60">Communities</div>
                  </div>
                  {profile.stats.followers !== undefined && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{profile.stats.followers}</div>
                      <div className="text-xs text-white/60">Followers</div>
                    </div>
                  )}
                  {profile.stats.following !== undefined && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{profile.stats.following}</div>
                      <div className="text-xs text-white/60">Following</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    About
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center justify-center text-white/60 text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Member since {new Date(profile.joinedAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>

              {/* Mutual Connections */}
              {profile.mutualConnections && profile.mutualConnections > 0 && (
                <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
                  <div className="flex items-center justify-center text-purple-300 text-sm">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    {profile.mutualConnections} mutual connection{profile.mutualConnections !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-3 pt-4">
                  {/* Follow Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      isFollowing
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                    } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center">
                      {followLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          {isFollowing ? (
                            <HeartSolid className="h-4 w-4 mr-2" />
                          ) : (
                            <HeartIcon className="h-4 w-4 mr-2" />
                          )}
                          {isFollowing ? 'Following' : 'Follow'}
                        </>
                      )}
                    </div>
                  </motion.button>

                  {/* Message Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartChat}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white rounded-xl font-semibold border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                  >
                    <div className="flex items-center justify-center">
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                      Message
                    </div>
                  </motion.button>
                </div>
              )}

              {/* Own Profile Edit Button */}
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Navigate to profile edit page
                    window.location.href = '/home/profile';
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white rounded-xl font-semibold border border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
                >
                  <div className="flex items-center justify-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </div>
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
