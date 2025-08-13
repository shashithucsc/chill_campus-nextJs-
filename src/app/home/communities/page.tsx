'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import AnimatedBackground from './components/AnimatedBackground';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Add this new component for handling image errors
const CommunityBanner = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
  const [imageError, setImageError] = useState(false);
  const defaultImage = '/images/default-community-banner.jpg';

  // Function to get full image URL with validation
  const getImageUrl = (url: string) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return defaultImage;
    
    const cleanUrl = url.trim();
    
    // Handle absolute URLs (including http/https)
    if (cleanUrl.match(/^https?:\/\//)) return cleanUrl;
    
    // Handle relative URLs starting with /
    if (cleanUrl.startsWith('/')) return cleanUrl;
    
    // Handle uploads directory files (assume it's a filename)
    return `/uploads/${cleanUrl}`;
  };

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <div className="relative h-48 overflow-hidden bg-slate-800">
      <Image
        src={imageError ? defaultImage : getImageUrl(imageUrl)}
        alt={`${name} community banner`}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
        onError={() => setImageError(true)}
        priority={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        unoptimized={getImageUrl(imageUrl).startsWith('/uploads/')}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number; // Changed from 'members' to 'memberCount' to match API
  imageUrl: string;
  category: string;
  isJoined: boolean;
  visibility: string;
  createdBy: string;
  coverImage?: string; // Add coverImage field from API
}

// Skeleton component for loading state
const CommunityCardSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden animate-pulse">
    <div className="h-48 bg-white/20"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-white/20 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-white/20 rounded"></div>
        <div className="h-4 bg-white/20 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-white/20 rounded w-1/3"></div>
        <div className="h-8 bg-white/20 rounded w-20"></div>
      </div>
    </div>
  </div>
);

export default function CommunitiesPage() {
  const { data: session } = useSession();
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [communitiesData, setCommunitiesData] = useState<Community[]>([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as any
      }
    }
  };

  useEffect(() => {
    // Fetch communities
    const fetchCommunities = async () => {
      try {
        const response = await fetch('/api/communities', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          // Transform the API response to match our interface
          const transformedCommunities = data.communities.map((community: any) => ({
            ...community,
            imageUrl: community.imageUrl || community.coverImage || '/images/default-community-banner.jpg'
          }));
          setCommunitiesData(transformedCommunities);
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoinToggle = async (communityId: string, currentlyJoined: boolean) => {
    if (!session) {
      // Redirect to login or show login prompt
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: currentlyJoined ? 'leave' : 'join'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setCommunitiesData(prev => prev.map(community => 
          community.id === communityId 
            ? { 
                ...community, 
                isJoined: !currentlyJoined,
                memberCount: data.memberCount
              }
            : community
        ));
      }
    } catch (error) {
      console.error('Error toggling membership:', error);
    }
  };

  const filteredCommunities = communitiesData.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}>
      {/* Animated Background */}
      <div className="fixed inset-0">
        {/* Dark gradient background */}
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}></div>
        
        {/* Client-side animated background component */}
        <AnimatedBackground />
      </div>

      <Navbar />
      <Sidebar />
      
      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          paddingLeft: isCollapsed ? '0px' : '256px'
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 pt-16"
      >
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-blue-100 bg-clip-text text-transparent mb-4">
              Explore Communities
            </h1>
            <p className="text-xl text-white/80">Discover and join communities that match your interests</p>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-10 space-y-6"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-2xl">
                <input
                  type="text"
                  placeholder="Search communities by name or description..."
                  className="w-full px-6 py-4 pl-14 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/20 transition-all duration-300 shadow-lg text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/70" />
              </div>

              {/* Create Community Button */}
              {session && (
                <Link href="/home/communities/create">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(31, 31, 67, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-8 py-4 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-xl transition-all duration-300 border border-white/30"
                    style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
                  >
                    <PlusIcon className="h-6 w-6 mr-3" />
                    Create Community
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {['All', 'Tech', 'Business', 'Clubs', 'Events', 'Academic'].map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? 'text-white shadow-lg border border-white/20'
                      : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 border border-white/20'
                  }`}
                  style={selectedCategory === category ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Communities Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loading ? (
              // Loading skeletons
              [...Array(6)].map((_, index) => (
                <CommunityCardSkeleton key={index} />
              ))
            ) : filteredCommunities.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full text-center py-20"
              >
                <div className="w-32 h-32 mx-auto mb-8 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center"
                     style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}>
                  <UserGroupIcon className="w-16 h-16 text-white/60" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No communities found</h3>
                <p className="text-white/70 text-lg mb-8">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : (
              filteredCommunities.map((community) => (
                <motion.div
                  key={community.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-3xl hover:border-white/30 hover:bg-white/15 transition-all duration-300 relative">
                    {/* View indicator */}
                    <div className="absolute top-4 left-4 z-10 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm flex items-center gap-1 border border-white/20"
                         style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View</span>
                    </div>
                    {/* Use Link to make the banner and title clickable */}
                    <Link href={`/home/communities/${community.id}`} className="cursor-pointer block">
                      <CommunityBanner imageUrl={community.imageUrl} name={community.name} />
                    </Link>
                    
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20">
                        {community.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <Link href={`/home/communities/${community.id}`} className="block">
                          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                            {community.name}
                          </h2>
                        </Link>
                        <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                          {community.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="h-5 w-5 text-white/60" />
                          <span className="text-white/80 text-sm font-medium">
                            {community.memberCount?.toLocaleString() || 0} members
                          </span>
                        </div>
                        
                        {session ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleJoinToggle(community.id, community.isJoined)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                              community.isJoined
                                ? 'bg-white/20 text-white hover:bg-white/30'
                                : 'text-white shadow-lg border border-white/20'
                            }`}
                            style={!community.isJoined ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
                          >
                            {community.isJoined ? 'Leave' : 'Join'}
                          </motion.button>
                        ) : (
                          <Link 
                            href="/auth/login"
                            className="px-4 py-2 rounded-lg font-medium text-sm text-white shadow-lg transition-all duration-300 border border-white/20"
                            style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
                          >
                            Sign in to Join
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}