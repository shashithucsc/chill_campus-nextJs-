'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  ChevronDownIcon,
  FunnelIcon,
  SparklesIcon,
  TagIcon
} from '@heroicons/react/24/outline';

// Sample data - In a real app, this would come from an API
const communities = [
  {
    id: '1',
    name: 'Computer Science',
    description: 'A community for CS students to share knowledge, projects, and cutting-edge technology discussions.',
    members: 1234,
    banner: '/uploads/1749996045421-m93mlw.webp',
    tags: ['Programming', 'Technology', 'Research'],
    category: 'Tech',
    isJoined: false,
  },
  {
    id: '2',
    name: 'Engineering Hub',
    description: 'Connect with fellow engineering students and collaborate on innovative projects.',
    members: 856,
    banner: '/uploads/1750575347949-8t4icy.png',
    tags: ['Mechanical', 'Electrical', 'Civil'],
    category: 'Tech',
    isJoined: true,
  },
  {
    id: '3',
    name: 'Business Network',
    description: 'Network with business students and share industry insights and opportunities.',
    members: 567,
    banner: '/uploads/1750577439376-dvzo74.jpg',
    tags: ['Marketing', 'Finance', 'Management'],
    category: 'Business',
    isJoined: false,
  },
  {
    id: '4',
    name: 'Photography Club',
    description: 'Capture moments, share techniques, and explore the art of photography together.',
    members: 423,
    banner: '/uploads/1750577661175-33yp3h.jpg',
    tags: ['Photography', 'Art', 'Creative'],
    category: 'Clubs',
    isJoined: false,
  },
  {
    id: '5',
    name: 'Campus Events',
    description: 'Stay updated with all campus events, festivals, and social gatherings.',
    members: 892,
    banner: '/uploads/1750578859340-bbhefe.jpg',
    tags: ['Events', 'Social', 'Campus'],
    category: 'Events',
    isJoined: true,
  },
  {
    id: '6',
    name: 'Study Groups',
    description: 'Form study groups, share resources, and excel in your academic journey.',
    members: 654,
    banner: '/uploads/1751788489853-ip3vxz.jpg',
    tags: ['Study', 'Academic', 'Collaboration'],
    category: 'Academic',
    isJoined: false,
  },
];

const categories = ['All', 'Tech', 'Business', 'Clubs', 'Events', 'Academic'];

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
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [communitiesData, setCommunitiesData] = useState(communities);

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
    // Simulate loading and fetch user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Fetch user data for auth check
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));

    return () => clearTimeout(timer);
  }, []);

  const filteredCommunities = communitiesData.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinToggle = (communityId: string) => {
    setCommunitiesData(prev => 
      prev.map(community => 
        community.id === communityId 
          ? { 
              ...community, 
              isJoined: !community.isJoined,
              members: community.isJoined ? community.members - 1 : community.members + 1
            }
          : community
      )
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1] as any,
                delay: Math.random() * 4
              }}
              className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
          
          {/* Glass particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3
              }}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
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
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
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
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-xl transition-all duration-300 border border-white/20"
                >
                  <PlusIcon className="h-6 w-6 mr-3" />
                  Create Community
                </motion.button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border border-white/20'
                      : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 border border-white/20'
                  }`}
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
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-16 h-16 text-white/60" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No communities found</h3>
                <p className="text-white/70 text-lg mb-8">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : (
              filteredCommunities.map((community, index) => (
                <motion.div
                  key={community.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-3xl hover:border-white/30 transition-all duration-300">
                    {/* Banner Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={community.banner}
                        alt={community.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20">
                          {community.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                          {community.name}
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                          {community.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {community.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white/90 text-xs rounded-full border border-white/20"
                          >
                            {tag}
                          </span>
                        ))}
                        {community.tags.length > 2 && (
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white/90 text-xs rounded-full border border-white/20">
                            +{community.tags.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="h-5 w-5 text-white/60" />
                          <span className="text-white/80 text-sm font-medium">
                            {community.members.toLocaleString()} members
                          </span>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleJoinToggle(community.id);
                          }}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                            community.isJoined
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                          }`}
                        >
                          {community.isJoined ? 'Leave' : 'Join'}
                        </motion.button>
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