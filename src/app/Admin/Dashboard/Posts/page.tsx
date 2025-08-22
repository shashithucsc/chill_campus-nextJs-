'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  FunnelIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  FlagIcon,
  CheckBadgeIcon,
  HeartIcon,
  TableCellsIcon,
  Squares2X2Icon,
  PlayIcon,
  NoSymbolIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  ChevronLeftIcon as ChevronLeftIconSolid,
  ChevronRightIcon as ChevronRightIconSolid,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useSession } from "next-auth/react";

// Define types
interface Post {
  id: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  authorId: string;
  communityName: string;
  communityId: string | null;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  status: 'Published' | 'Reported' | 'Disabled';
  reportReasons?: string[];
  reportsCount: number;
  hasMedia: boolean;
  media?: string[]; // Array of media URLs
  mediaUrl?: string | null;
  mediaType?: string;
  disabled?: boolean;
  disabledBy?: string;
  disabledAt?: string;
  disableReason?: string;
}

interface Community {
  id: string;
  name: string;
}

interface PostsResponse {
  success: boolean;
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalPosts: number;
    publishedPosts: number;
    reportedPosts: number;
    disabledPosts: number;
  };
  communities: Community[];
}

export default function PostsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Media viewer state
  const [selectedMedia, setSelectedMedia] = useState<{
    post: Post;
    mediaIndex: number;
  } | null>(null);
  
  // Keyboard navigation for media viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMedia) return;
      
      if (e.key === 'Escape') {
        setSelectedMedia(null);
      } else if (e.key === 'ArrowLeft' && selectedMedia.mediaIndex > 0) {
        setSelectedMedia({
          ...selectedMedia,
          mediaIndex: selectedMedia.mediaIndex - 1
        });
      } else if (e.key === 'ArrowRight' && selectedMedia.post.media && selectedMedia.mediaIndex < selectedMedia.post.media.length - 1) {
        setSelectedMedia({
          ...selectedMedia,
          mediaIndex: selectedMedia.mediaIndex + 1
        });
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia]);
  
  // Data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    reportedPosts: 0,
    disabledPosts: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch posts data
  const fetchPosts = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        community: communityFilter,
        status: statusFilter,
        sortBy: sortOrder === 'newest' ? 'createdAt' : 
                sortOrder === 'oldest' ? 'createdAt' : 
                sortOrder === 'mostLikes' ? 'likesCount' : 'commentsCount',
        sortOrder: sortOrder === 'oldest' ? 'asc' : 'desc'
      });

      const response = await fetch(`/api/admin/posts?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PostsResponse = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
        setCommunities(data.communities);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Handle post actions
  const handlePostAction = async (postId: string, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/actions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminNotes: reason || `${action} performed by admin`
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`${action} successful:`, result.message);
        
        // Refresh posts after action
        fetchPosts();
      } else {
        const error = await response.json();
        console.error(`${action} failed:`, error.error);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  // Effects
  useEffect(() => {
    if (session?.user) {
      fetchPosts();
    }
  }, [session, currentPage, search, communityFilter, statusFilter, sortOrder]);

  // Calculate reported posts count
  const reportedPostsCount = stats.reportedPosts;

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = '';
    let icon = null;

    switch (status) {
      case 'Published':
        bgColor = 'bg-green-500/20';
        textColor = 'text-green-300';
        icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
        break;
      case 'Reported':
        bgColor = 'bg-red-500/20';
        textColor = 'text-red-300';
        icon = <FlagIcon className="h-4 w-4 mr-1" />;
        break;
      case 'Disabled':
        bgColor = 'bg-gray-500/20';
        textColor = 'text-gray-300';
        icon = <NoSymbolIcon className="h-4 w-4 mr-1" />;
        break;
      default:
        bgColor = 'bg-blue-500/20';
        textColor = 'text-blue-300';
        icon = <DocumentTextIcon className="h-4 w-4 mr-1" />;
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status}
      </span>
    );
  };

  // Post Card Component for Grid View
  const PostCard = ({ post, index }: { post: Post, index: number }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={`bg-black/30 backdrop-blur-md rounded-xl border ${
          post.status === 'Reported' ? 'border-red-500/30' : 'border-white/10'
        } shadow-lg p-4 hover:shadow-xl transition-all`}
      >
        {/* Author Info */}
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-3">
            {post.authorAvatar ? (
              <Image src={post.authorAvatar} alt={post.authorName} width={40} height={40} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-6 w-6 text-white/70" />
            )}
          </div>
          <div>
            <div className="font-medium text-white">{post.authorName}</div>
            <div className="text-white/60 text-xs">
              {new Date(post.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="ml-auto">
            <StatusBadge status={post.status} />
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-white/90 text-sm line-clamp-2">
            {post.content}
          </p>
        </div>

        {/* Post Media (if any) */}
        {post.hasMedia && post.media && post.media.length > 0 && (
          <div 
            className="mb-3 h-32 w-full relative rounded-lg overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
            onClick={() => setSelectedMedia({ post, mediaIndex: 0 })}
          >
            {/* Main media display */}
            {post.media[0].toLowerCase().includes('.mp4') ||
             post.media[0].toLowerCase().includes('.webm') ||
             post.media[0].toLowerCase().includes('.mov') ? (
              <div className="bg-black/50 h-full w-full flex items-center justify-center relative">
                <PlayIcon className="h-12 w-12 text-white/70 group-hover:text-white transition-colors" />
                <VideoCameraIcon className="absolute top-2 left-2 h-5 w-5 text-white/80" />
              </div>
            ) : (
              <div className="relative h-full w-full">
                <Image 
                  src={post.media[0]} 
                  alt="Post media" 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }} 
                />
                <PhotoIcon className="absolute top-2 left-2 h-5 w-5 text-white/80" />
              </div>
            )}
            
            {/* Media count indicator */}
            {post.media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                +{post.media.length - 1}
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                Click to view {post.media.length > 1 ? `${post.media.length} items` : 'media'}
              </div>
            </div>
          </div>
        )}

        {/* Report Reason */}
        {post.status === 'Reported' && post.reportReasons && post.reportReasons.length > 0 && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/10 text-red-300 text-xs">
            <strong>Report reasons:</strong> {post.reportReasons.join(', ')}
          </div>
        )}

        {/* Community & Stats */}
        <div className="flex justify-between items-center text-white/60 text-xs mb-4">
          <div className="flex items-center">
            <RectangleGroupIcon className="h-4 w-4 mr-1" />
            {post.communityName}
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <HeartIcon className="h-4 w-4 mr-1" />
              {post.likes}
            </span>
            <span className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              {post.comments}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between border-t border-white/10 pt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-all text-xs"
          >
            <EyeIcon className="h-3.5 w-3.5 mr-1" /> View
          </motion.button>

          {post.status === 'Reported' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-2 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition-all text-xs"
              onClick={() => handlePostAction(post.id, 'resolve_reports')}
            >
              <CheckBadgeIcon className="h-3.5 w-3.5 mr-1" /> Resolve
            </motion.button>
          )}

          {post.status !== 'Disabled' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-lg transition-all text-xs"
              onClick={() => handlePostAction(post.id, 'disable')}
            >
              <XCircleIcon className="h-3.5 w-3.5 mr-1" /> Disable
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all text-xs"
            onClick={() => handlePostAction(post.id, 'delete')}
          >
            <TrashIcon className="h-3.5 w-3.5 mr-1" /> Delete
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Post Table Row Component
  const PostRow = ({ post, index }: { post: Post, index: number }) => {
    return (
      <motion.tr
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={`${index % 2 === 0 ? 'bg-black/20' : 'bg-black/10'} ${
          post.status === 'Reported' ? 'border-l-2 border-red-500/50' : ''
        } hover:bg-white/5 transition-all`}
      >
        <td className="py-4 px-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-3">
              {post.authorAvatar ? (
                <Image src={post.authorAvatar} alt={post.authorName} width={40} height={40} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-6 w-6 text-white/70" />
              )}
            </div>
            <div>
              <div className="font-medium text-white">{post.authorName}</div>
              <div className="text-white/60 text-xs">{post.communityName}</div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4 text-white/80">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <p className="line-clamp-2 text-sm max-w-xs">
                {post.content}
              </p>
              {post.status === 'Reported' && post.reportReasons && post.reportReasons.length > 0 && (
                <div className="mt-1 p-1 px-2 rounded bg-red-500/10 text-red-300 text-xs inline-block">
                  {post.reportReasons[0]}
                </div>
              )}
            </div>
            
            {/* Media indicator */}
            {post.hasMedia && post.media && post.media.length > 0 && (
              <button
                onClick={() => setSelectedMedia({ post, mediaIndex: 0 })}
                className="flex-shrink-0 p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors group relative"
                title={`View ${post.media.length} media ${post.media.length === 1 ? 'item' : 'items'}`}
              >
                {post.media[0].toLowerCase().includes('.mp4') ||
                 post.media[0].toLowerCase().includes('.webm') ||
                 post.media[0].toLowerCase().includes('.mov') ? (
                  <VideoCameraIcon className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                ) : (
                  <PhotoIcon className="h-4 w-4 text-green-400 group-hover:text-green-300" />
                )}
                {post.media.length > 1 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {post.media.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex flex-col">
            <div className="text-white/70 text-sm">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="text-white/50 text-xs">
              {new Date(post.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <span className="flex items-center">
              <HeartIcon className="h-4 w-4 mr-1" />
              {post.likes}
            </span>
            <span className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              {post.comments}
            </span>
          </div>
        </td>
        <td className="py-4 px-4">
          <StatusBadge status={post.status} />
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded transition-all"
            >
              <EyeIcon className="h-4 w-4" />
            </motion.button>
            {post.status === 'Reported' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded transition-all"
                onClick={() => handlePostAction(post.id, 'resolve_reports')}
              >
                <CheckBadgeIcon className="h-4 w-4" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded transition-all"
              onClick={() => handlePostAction(post.id, 'delete')}
            >
              <TrashIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </td>
      </motion.tr>
    );
  };

  return (
    <main className="pt-8 px-4 sm:px-8 pb-8 transition-all">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
            <p>Error: {error}</p>
            <button 
              onClick={fetchPosts}
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 p-6 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-400 mr-3" />
                    <h1 className="text-2xl font-bold text-white">Manage Posts</h1>
                  </div>
                  <p className="text-white/70 mt-2">Review all community posts across the platform.</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                    <span>Total: {stats.totalPosts}</span>
                    <span>Published: {stats.publishedPosts}</span>
                    <span>Reported: {stats.reportedPosts}</span>
                    <span>Disabled: {stats.disabledPosts}</span>
                  </div>
                </div>
                {reportedPostsCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 shadow-lg hover:shadow-xl transition-all text-sm font-medium"
                    onClick={() => setStatusFilter('Reported')}
                  >
                    <FlagIcon className="h-5 w-5 mr-2" /> View {reportedPostsCount} Reported Posts
                  </motion.button>
                )}
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
                  placeholder="Search posts by content, author, or community..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300 shadow-lg"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-white/60 absolute right-4 top-3.5" />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <select
                    value={communityFilter}
                    onChange={(e) => setCommunityFilter(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
                  >
                    <option value="All">All Communities</option>
                    {communities.map(community => (
                      <option key={community.id} value={community.name}>{community.name}</option>
                    ))}
                  </select>
                  <RectangleGroupIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
                  >
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Reported">Reported</option>
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
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="mostLikes">Most Likes</option>
                    <option value="mostComments">Most Comments</option>
                  </select>
                  <CalendarIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white/80 hover:bg-white/10 transition-all shadow-lg"
                  onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                >
                  {viewMode === 'table' ? (
                    <Squares2X2Icon className="h-5 w-5" />
                  ) : (
                    <TableCellsIcon className="h-5 w-5" />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white/80 hover:bg-white/10 transition-all shadow-lg"
                  onClick={fetchPosts}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Posts Content - Table View */}
            {viewMode === 'table' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl p-6 mb-6 overflow-hidden hidden md:block"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-white/10">
                        <th className="py-4 px-4 font-semibold text-white/90">Author</th>
                        <th className="py-4 px-4 font-semibold text-white/90">Content & Media</th>
                        <th className="py-4 px-4 font-semibold text-white/90">Date</th>
                        <th className="py-4 px-4 font-semibold text-white/90">Engagement</th>
                        <th className="py-4 px-4 font-semibold text-white/90">Status</th>
                        <th className="py-4 px-4 font-semibold text-white/90">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post, index) => (
                        <PostRow key={post.id} post={post} index={index} />
                      ))}
                      {posts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-white/60">No posts found matching your filters</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Posts Content - Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
                {posts.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full bg-black/30 backdrop-blur-md rounded-xl p-10 border border-white/10 text-center"
                  >
                    <DocumentTextIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl text-white font-medium mb-2">No posts found</h3>
                    <p className="text-white/60">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Pagination */}
            {posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex justify-between items-center mt-8 text-white/80"
              >
                <div className="text-sm">
                  Showing <span className="font-medium">{posts.length}</span> of <span className="font-medium">{pagination.totalPosts}</span> posts
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 rounded-lg bg-black/30 backdrop-blur-md hover:bg-white/10 transition-all disabled:opacity-50"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button 
                          key={page}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            page === pagination.currentPage 
                              ? 'bg-blue-500/80 text-white' 
                              : 'hover:bg-white/10'
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    className="p-2 rounded-lg bg-black/30 backdrop-blur-md hover:bg-white/10 transition-all disabled:opacity-50"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
        
        {/* Media Viewer Modal */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMedia(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-xl border border-gray-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Media from {selectedMedia.post.authorName}'s Post
                    </h3>
                    <p className="text-sm text-gray-400">
                      {selectedMedia.mediaIndex + 1} of {selectedMedia.post.media?.length || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Media Content */}
                <div className="relative">
                  {selectedMedia.post.media && selectedMedia.post.media[selectedMedia.mediaIndex] && (
                    <div className="flex items-center justify-center bg-black min-h-[400px] max-h-[600px]">
                      {selectedMedia.post.media[selectedMedia.mediaIndex].toLowerCase().includes('.mp4') ||
                       selectedMedia.post.media[selectedMedia.mediaIndex].toLowerCase().includes('.webm') ||
                       selectedMedia.post.media[selectedMedia.mediaIndex].toLowerCase().includes('.mov') ? (
                        <video
                          src={selectedMedia.post.media[selectedMedia.mediaIndex]}
                          controls
                          className="max-w-full max-h-full object-contain"
                          autoPlay
                        />
                      ) : (
                        <Image
                          src={selectedMedia.post.media[selectedMedia.mediaIndex]}
                          alt={`Media ${selectedMedia.mediaIndex + 1}`}
                          width={800}
                          height={600}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Show error message
                            const errorDiv = target.parentElement?.querySelector('.error-message');
                            if (errorDiv) {
                              errorDiv.classList.remove('hidden');
                            }
                          }}
                        />
                      )}
                      
                      {/* Error fallback */}
                      <div className="error-message hidden absolute inset-0 items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <PhotoIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                          <p>Failed to load media</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation arrows */}
                  {selectedMedia.post.media && selectedMedia.post.media.length > 1 && (
                    <>
                      {selectedMedia.mediaIndex > 0 && (
                        <button
                          onClick={() => setSelectedMedia({
                            ...selectedMedia,
                            mediaIndex: selectedMedia.mediaIndex - 1
                          })}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        >
                          <ChevronLeftIconSolid className="h-6 w-6" />
                        </button>
                      )}
                      
                      {selectedMedia.mediaIndex < selectedMedia.post.media.length - 1 && (
                        <button
                          onClick={() => setSelectedMedia({
                            ...selectedMedia,
                            mediaIndex: selectedMedia.mediaIndex + 1
                          })}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        >
                          <ChevronRightIconSolid className="h-6 w-6" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Media List */}
                {selectedMedia.post.media && selectedMedia.post.media.length > 1 && (
                  <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedMedia.post.media.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedMedia({
                            ...selectedMedia,
                            mediaIndex: index
                          })}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedMedia.mediaIndex 
                              ? 'border-blue-500 ring-2 ring-blue-500/30' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {media.toLowerCase().includes('.mp4') ||
                           media.toLowerCase().includes('.webm') ||
                           media.toLowerCase().includes('.mov') ? (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <PlayIcon className="h-6 w-6 text-white/70" />
                            </div>
                          ) : (
                            <Image
                              src={media}
                              alt={`Thumbnail ${index + 1}`}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Info */}
                <div className="p-4 border-t border-gray-700 bg-gray-850">
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="font-medium">Post Content:</span>
                  </p>
                  <p className="text-white/90 text-sm bg-gray-800 p-3 rounded-lg">
                    {selectedMedia.post.content}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span>Posted: {new Date(selectedMedia.post.createdAt).toLocaleDateString()}</span>
                    <span>Community: {selectedMedia.post.communityName}</span>
                    <span>Status: {selectedMedia.post.status}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
}
