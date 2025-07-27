'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  EyeIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  FunnelIcon,
  CalendarIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

// Define the type for community data - matches our backend API
interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  updatedAt?: string;
  status: 'Active' | 'Disabled';
  coverImage: string;
  tags: string[];
  category?: string;
  creatorName?: string;
}

// Interface for the display layer
interface DisplayCommunity {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  status: 'Active' | 'Disabled';
  coverImage: string;
  tags: string[];
}

// Transform backend community to display community
const transformCommunity = (community: Community): DisplayCommunity => ({
  id: community._id,
  name: community.name,
  description: community.description,
  memberCount: community.memberCount,
  createdAt: community.createdAt,
  status: community.status,
  coverImage: community.coverImage || '',
  tags: community.tags || []
});

// Helper function to get proper image URL
const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return '/images/default-community-banner.jpg';
  }
  
  const cleanUrl = imageUrl.trim();
  
  // If it's already a full URL (starts with http/https), return as is
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  // If it starts with /, it's already a proper path
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }
  
  // Otherwise, assume it's a filename in uploads directory
  return `/uploads/${cleanUrl}`;
};

// Mock community data
const mockCommunities: Community[] = [];

// Community Card Component
const CommunityCard = ({ 
  community, 
  index, 
  onStatusToggle, 
  onDelete 
}: { 
  community: Community, 
  index: number,
  onStatusToggle: (id: string, currentStatus: string) => void,
  onDelete: (id: string) => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-lg overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Cover Image */}
      <div className="h-40 w-full relative overflow-hidden group">
        {community.coverImage && community.coverImage.trim() !== '' ? (
          <Image 
            src={getImageUrl(community.coverImage)} 
            alt={community.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/images/default-community-banner.jpg";
            }}
            unoptimized={getImageUrl(community.coverImage).startsWith('/uploads/')}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-purple-900/60 to-blue-900/60 flex items-center justify-center group-hover:from-purple-800/70 group-hover:to-blue-800/70 transition-colors duration-300">
            <RectangleGroupIcon className="h-16 w-16 text-white/50" />
          </div>
        )}
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Status badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
          community.status === 'Active' 
            ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
            : 'bg-red-500/30 text-red-300 border border-red-500/50'
        }`}>
          {community.status}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2 truncate">{community.name}</h3>
        <p className="text-white/70 text-sm mb-4 line-clamp-2">{community.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {community.tags && community.tags.length > 0 ? community.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/80">
              {tag}
            </span>
          )) : (
            <span className="px-2 py-1 bg-white/5 rounded-md text-xs text-white/50">
              No tags
            </span>
          )}
        </div>
        
        {/* Stats */}
        <div className="flex justify-between text-white/60 text-sm mb-4">
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            {community.memberCount} members
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {new Date(community.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', 
              month: 'short', 
              day: 'numeric'
            })}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between border-t border-white/10 pt-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-all text-sm"
            title="View Community"
          >
            <EyeIcon className="h-4 w-4 mr-1.5" /> View
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusToggle(community._id, community.status)}
            className="flex items-center px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-lg transition-all text-sm"
            title={community.status === 'Active' ? 'Disable Community' : 'Enable Community'}
          >
            {community.status === 'Active' 
              ? <><XCircleIcon className="h-4 w-4 mr-1.5" /> Disable</>
              : <><CheckCircleIcon className="h-4 w-4 mr-1.5" /> Enable</>
            }
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(community._id)}
            className="flex items-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all text-sm"
            title="Delete Community"
          >
            <TrashIcon className="h-4 w-4 mr-1.5" /> Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunitiesPage() {
  // UI State
  const [isMobile, setIsMobile] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state for adding community
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    coverImage: null as File | null
  });

  // Handle form submission
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverImageUrl = '';
      
      // Upload image if provided
      if (formData.coverImage) {
        console.log('Uploading image...', formData.coverImage.name);
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.coverImage);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          coverImageUrl = uploadData.filePath || uploadData.url;
          console.log('Image uploaded successfully:', coverImageUrl);
        } else {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Failed to upload image: ${errorText}`);
        }
      }

      // Get current user session for createdBy field
      console.log('Getting user session...');
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      console.log('Session data:', sessionData);
      
      if (!sessionData?.user?.id) {
        throw new Error('User session not found. Please login again.');
      }

      // Prepare community data
      const communityData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        coverImage: coverImageUrl,
        createdBy: sessionData.user.id
      };

      console.log('Creating community with data:', communityData);

      // Create community
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(communityData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Community creation failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create community');
      }

      const result = await response.json();
      console.log('Community created successfully:', result);

      // Reset form and close modal
      setFormData({ name: '', description: '', category: '', tags: '', coverImage: null });
      setImagePreview(null);
      setShowAddModal(false);
      
      // Refresh communities list
      await fetchCommunities();
      
      alert('Community created successfully!');
    } catch (error) {
      console.error('Error creating community:', error);
      alert(`Failed to create community: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle community status toggle (Enable/Disable)
  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
      const response = await fetch(`/api/communities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update community status');
      }

      // Refresh communities list
      fetchCommunities();
    } catch (error) {
      console.error('Error updating community status:', error);
      alert('Failed to update community status. Please try again.');
    }
  };

  // Handle community deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/communities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete community');
      }

      // Refresh communities list
      fetchCommunities();
    } catch (error) {
      console.error('Error deleting community:', error);
      alert('Failed to delete community. Please try again.');
    }
  };

  // Handle image file selection with preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({...formData, coverImage: file || null});
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Data and filtering state
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCommunities, setTotalCommunities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);

  // Fetch communities from API
  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        admin: 'true',
        page: currentPage.toString(),
        limit: '20', // Get more for client-side filtering
        ...(search && { search }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
      });

      const response = await fetch(`/api/communities?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }

      const data = await response.json();
      setCommunities(data.communities || []);
      setTotalCommunities(data.totalCommunities || 0);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setCommunities([]);
      setTotalCommunities(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load communities on component mount and when filters change
  useEffect(() => {
    fetchCommunities();
  }, [currentPage, statusFilter]);

  // Effect to refetch when search changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchCommunities();
      } else {
        setCurrentPage(1); // This will trigger fetchCommunities via the above useEffect
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Filter and sort communities (client-side for immediate response)
  useEffect(() => {
    let results = [...communities];
    
    // Apply search filter (if not already filtered by API)
    if (search && !statusFilter || statusFilter === 'All') {
      results = results.filter(community => 
        community.name.toLowerCase().includes(search.toLowerCase()) || 
        community.description.toLowerCase().includes(search.toLowerCase()) ||
        (community.tags && community.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
      );
    }
    
    // Apply status filter (if not already filtered by API)
    if (statusFilter !== 'All') {
      results = results.filter(community => community.status === statusFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      if (sortOrder === 'latest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    setFilteredCommunities(results);
  }, [communities, search, statusFilter, sortOrder]);

  // Count active communities
  const activeCommunities = communities.filter(c => c.status === 'Active').length;

  return (
    <main className="pt-8 px-4 sm:px-8 pb-8 transition-all">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 p-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <RectangleGroupIcon className="h-8 w-8 text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">Manage Communities</h1>
              </div>
              <p className="text-white/70 mt-2">You are managing {activeCommunities} active communities out of {totalCommunities} total.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all text-sm font-medium"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" /> Create New Community
            </motion.button>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search communities by name, description, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300 shadow-lg"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-white/60 absolute right-4 top-3.5" />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
              <FunnelIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <CalendarIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden animate-pulse">
                <div className="h-40 w-full bg-white/10"></div>
                <div className="p-4">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded mb-3 w-3/4"></div>
                  <div className="flex space-x-2 mb-3">
                    <div className="h-6 bg-white/10 rounded w-16"></div>
                    <div className="h-6 bg-white/10 rounded w-20"></div>
                  </div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCommunities.map((community, index) => (
              <CommunityCard 
                key={community._id} 
                community={community} 
                index={index}
                onStatusToggle={handleStatusToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/30 backdrop-blur-md rounded-xl p-10 border border-white/10 text-center"
          >
            <RectangleGroupIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white font-medium mb-2">No communities found</h3>
            <p className="text-white/60">Try adjusting your search or filters to find what you're looking for.</p>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && filteredCommunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-between items-center mt-8 text-white/80"
          >
            <div className="text-sm">
              Showing <span className="font-medium">{filteredCommunities.length}</span> of <span className="font-medium">{totalCommunities}</span> communities
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-black/30 backdrop-blur-md hover:bg-white/10 transition-all">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex space-x-1">
                <button className="w-8 h-8 rounded-lg bg-blue-500/80 text-white flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">2</button>
              </div>
              <button className="p-2 rounded-lg bg-black/30 backdrop-blur-md hover:bg-white/10 transition-all">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

      {/* Add Community Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-lg max-h-[90vh] my-8 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create New Community</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setImagePreview(null);
                    setFormData({ name: '', description: '', category: '', tags: '', coverImage: null });
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleCreateCommunity}>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Community Name *</label>
                  <input
                    type="text"
                    placeholder="Enter community name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    minLength={3}
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  />
                  <p className="text-white/50 text-xs mt-1">3-50 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Description *</label>
                  <textarea
                    placeholder="Enter community description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    minLength={10}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all resize-none"
                  />
                  <p className="text-white/50 text-xs mt-1">{formData.description.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  >
                    <option value="">Select a category</option>
                    <option value="Tech">Technology</option>
                    <option value="Arts">Arts</option>
                    <option value="Clubs">Clubs</option>
                    <option value="Events">Events</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Cover Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-white/80 text-sm mb-2">Preview:</p>
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/20">
                        <Image
                          src={imagePreview}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-white/50 text-xs mt-1">Optional - Upload JPG, PNG, WebP or GIF (max 5MB)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g., programming, web development, coding"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  />
                  <p className="text-white/50 text-xs mt-1">Optional - Separate multiple tags with commas</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setImagePreview(null);
                      setFormData({ name: '', description: '', category: '', tags: '', coverImage: null });
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim() || !formData.description.trim() || !formData.category}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : 'Create Community'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
