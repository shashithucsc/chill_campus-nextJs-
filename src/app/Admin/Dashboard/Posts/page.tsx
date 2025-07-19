'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlusCircleIcon,
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
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

// Define types
interface Post {
  id: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  communityName: string;
  communityId: string;
  createdAt: string;
  likes: number;
  comments: number;
  status: 'Published' | 'Reported' | 'Deleted';
  reportReason?: string;
  hasMedia: boolean;
  mediaUrl?: string;
}

interface Community {
  id: string;
  name: string;
}

// Mock communities data
const mockCommunities: Community[] = [
  { id: '1', name: 'Computer Science Club' },
  { id: '2', name: 'Art & Design Studio' },
  { id: '3', name: 'Sports Enthusiasts' },
  { id: '4', name: 'Mathematics Forum' },
  { id: '5', name: 'Music Production' },
  { id: '6', name: 'Entrepreneurship Network' },
  { id: '7', name: 'Literature Club' },
  { id: '8', name: 'Psychology Society' },
];

// Mock posts data
const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Just finished my final project for the semester! Check out this web application I built using React and Node.js. It includes real-time chat, file sharing, and collaborative features.',
    authorName: 'Alice Johnson',
    authorAvatar: '/uploads/683f0d865a3fc6817b6ca1cf-avatar.jpg',
    communityName: 'Computer Science Club',
    communityId: '1',
    createdAt: '2025-07-15T14:30:00',
    likes: 24,
    comments: 8,
    status: 'Published',
    hasMedia: true,
    mediaUrl: '/uploads/1752133976371-io0.png'
  },
  {
    id: '2',
    content: 'This post contains inappropriate content and has been reported multiple times. The content violates community guidelines regarding respectful communication.',
    authorName: 'Bob Smith',
    authorAvatar: '/uploads/6846aec43f81033dbb04da7b-avatar.jpg',
    communityName: 'Literature Club',
    communityId: '7',
    createdAt: '2025-07-14T09:15:00',
    likes: 3,
    comments: 15,
    status: 'Reported',
    reportReason: 'Inappropriate content',
    hasMedia: false
  },
  {
    id: '3',
    content: 'Our team won the inter-university basketball championship! Proud of everyone who participated. Here are some highlights from the final match.',
    authorName: 'Charlie Davis',
    authorAvatar: '/uploads/68551cbb981126d63000ced3-avatar.jpg',
    communityName: 'Sports Enthusiasts',
    communityId: '3',
    createdAt: '2025-07-13T18:45:00',
    likes: 56,
    comments: 12,
    status: 'Published',
    hasMedia: true,
    mediaUrl: '/uploads/1752134725259-k7pu.png'
  },
  {
    id: '4',
    content: 'This post was deleted by the administrator for violating community guidelines. The post contained spam content.',
    authorName: 'Diana Miller',
    authorAvatar: '/uploads/6857d2c9c069b2b51f421993-avatar.jpg',
    communityName: 'Mathematics Forum',
    communityId: '4',
    createdAt: '2025-07-12T11:20:00',
    likes: 0,
    comments: 0,
    status: 'Deleted',
    hasMedia: false
  },
  {
    id: '5',
    content: 'Check out this new music composition I created for our upcoming campus festival. Let me know what you think!',
    authorName: 'Ethan Wilson',
    authorAvatar: '/uploads/687606e956d069cefd283ca1-avatar.jpg',
    communityName: 'Music Production',
    communityId: '5',
    createdAt: '2025-07-11T16:10:00',
    likes: 42,
    comments: 7,
    status: 'Published',
    hasMedia: true,
    mediaUrl: '/uploads/1750578673157-mgtbza.mp4'
  },
  {
    id: '6',
    content: 'This post contains potentially offensive material that has been reported by multiple users. The content seems to target specific individuals.',
    authorName: 'Fiona Campbell',
    authorAvatar: '',
    communityName: 'Psychology Society',
    communityId: '8',
    createdAt: '2025-07-10T08:30:00',
    likes: 5,
    comments: 23,
    status: 'Reported',
    reportReason: 'Harassment',
    hasMedia: false
  },
  {
    id: '7',
    content: 'Looking for team members for my startup idea. We\'re working on an AI-powered study assistant for students. DM if interested!',
    authorName: 'George Brown',
    authorAvatar: '',
    communityName: 'Entrepreneurship Network',
    communityId: '6',
    createdAt: '2025-07-09T14:20:00',
    likes: 18,
    comments: 9,
    status: 'Published',
    hasMedia: false
  },
  {
    id: '8',
    content: 'I\'m organizing a book club meeting this Friday at the campus library. We\'ll be discussing "The Alchemist" by Paulo Coelho. Everyone is welcome!',
    authorName: 'Hannah Lee',
    authorAvatar: '',
    communityName: 'Literature Club',
    communityId: '7',
    createdAt: '2025-07-08T13:45:00',
    likes: 15,
    comments: 6,
    status: 'Published',
    hasMedia: false
  },
  {
    id: '9',
    content: 'This post was reported for containing spam links to external websites that may be harmful or unsafe.',
    authorName: 'Ian Wright',
    authorAvatar: '',
    communityName: 'Computer Science Club',
    communityId: '1',
    createdAt: '2025-07-07T17:30:00',
    likes: 2,
    comments: 4,
    status: 'Reported',
    reportReason: 'Spam content',
    hasMedia: true,
    mediaUrl: '/uploads/1752133225560-92p9.png'
  },
  {
    id: '10',
    content: 'Check out my latest painting inspired by campus life during spring. I used a mix of acrylic and watercolor techniques.',
    authorName: 'Julia Morris',
    authorAvatar: '',
    communityName: 'Art & Design Studio',
    communityId: '2',
    createdAt: '2025-07-06T15:50:00',
    likes: 38,
    comments: 11,
    status: 'Published',
    hasMedia: true,
    mediaUrl: '/uploads/1751788489853-ip3vxz.jpg'
  }
];

const navLinks = [
  { name: "Overview", icon: HomeIcon, href: "/Admin/Dashboard" },
  { name: "Users", icon: UsersIcon, href: "/Admin/Dashboard/Users" },
  { name: "Communities", icon: RectangleGroupIcon, href: "/Admin/Dashboard/Communities" },
  { name: "Posts", icon: DocumentTextIcon, href: "/Admin/Dashboard/Posts" },
  { name: "Reports", icon: ExclamationTriangleIcon, href: "#" },
  { name: "Settings", icon: Cog6ToothIcon, href: "#" },
];

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
    case 'Deleted':
      bgColor = 'bg-gray-500/20';
      textColor = 'text-gray-300';
      icon = <TrashIcon className="h-4 w-4 mr-1" />;
      break;
    default:
      bgColor = 'bg-blue-500/20';
      textColor = 'text-blue-300';
      icon = <DocumentTextIcon className="h-4 w-4 mr-1" />;
  }

  return (
    <span className={`flex items-center px-2 py-1 rounded-full text-sm ${bgColor} ${textColor} border border-${textColor.replace('text-', '')}/40`}>
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
      {post.hasMedia && post.mediaUrl && (
        <div className="mb-3 h-32 w-full relative rounded-lg overflow-hidden">
          {post.mediaUrl.endsWith('.mp4') ? (
            <div className="bg-black/50 h-full w-full flex items-center justify-center">
              <PlayIcon className="h-12 w-12 text-white/70" />
            </div>
          ) : (
            <Image 
              src={post.mediaUrl} 
              alt="Post media" 
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }} 
            />
          )}
        </div>
      )}

      {/* Report Reason */}
      {post.status === 'Reported' && post.reportReason && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 text-red-300 text-xs">
          <strong>Report reason:</strong> {post.reportReason}
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
          >
            <CheckBadgeIcon className="h-3.5 w-3.5 mr-1" /> Review
          </motion.button>
        )}

        {post.status !== 'Deleted' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded-lg transition-all text-xs"
          >
            <XCircleIcon className="h-3.5 w-3.5 mr-1" /> Disable
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all text-xs"
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
        <p className="line-clamp-2 text-sm max-w-xs">
          {post.content}
        </p>
        {post.status === 'Reported' && post.reportReason && (
          <div className="mt-1 p-1 px-2 rounded bg-red-500/10 text-red-300 text-xs inline-block">
            {post.reportReason}
          </div>
        )}
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
        <div className="flex space-x-2">
          <div className="flex items-center text-white/70 text-sm">
            <HeartIcon className="h-4 w-4 mr-1 text-pink-400/70" /> {post.likes}
          </div>
          <div className="flex items-center text-white/70 text-sm">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 text-blue-400/70" /> {post.comments}
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={post.status} />
      </td>
      <td className="py-4 px-4">
        <div className="flex space-x-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-all"
          >
            <EyeIcon className="h-4 w-4" />
          </motion.button>
          
          {post.status === 'Reported' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-300 transition-all"
            >
              <CheckBadgeIcon className="h-4 w-4" />
            </motion.button>
          )}
          
          {post.status !== 'Deleted' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-all"
            >
              <XCircleIcon className="h-4 w-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
          >
            <TrashIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
};

// Main component
export default function PostsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts);
  const [isMobile, setIsMobile] = useState(false);
  
  // Reported posts count
  const reportedPostsCount = mockPosts.filter(p => p.status === 'Reported').length;

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Switch to grid view on mobile automatically
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Filter and sort posts
  useEffect(() => {
    let results = [...mockPosts];
    
    // Apply search filter
    if (search) {
      results = results.filter(post => 
        post.content.toLowerCase().includes(search.toLowerCase()) || 
        post.authorName.toLowerCase().includes(search.toLowerCase()) ||
        post.communityName.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply community filter
    if (communityFilter !== 'All') {
      results = results.filter(post => post.communityId === communityFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      results = results.filter(post => post.status === statusFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    setFilteredPosts(results);
  }, [search, communityFilter, statusFilter, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 font-sans">
      {/* Glassy Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-black/30 backdrop-blur-xl shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/Admin/Dashboard">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-xl" />
            </Link>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent tracking-tight">Admin Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <UserIcon className="h-7 w-7 text-white" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-black/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 py-2 z-50"
                  >
                    <button className="w-full flex items-center px-4 py-3 text-white/90 hover:bg-white/10 transition-all">
                      <Cog6ToothIcon className="h-5 w-5 mr-2" /> Settings
                    </button>
                    <button className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/20 transition-all">
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setSidebarOpen((v) => !v)}>
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || typeof window === "undefined" || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 shadow-xl z-20 ${isMobile ? 'block' : 'hidden md:block'}`}
          >
            <nav className="flex flex-col py-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-6 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium text-lg ${
                    link.name === "Posts" ? "bg-white/10 text-white" : ""
                  }`}
                >
                  <link.icon className="h-6 w-6 mr-3" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-4 sm:px-8 pb-8 transition-all">
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
                {mockCommunities.map(community => (
                  <option key={community.id} value={community.id}>{community.name}</option>
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
                <option value="Deleted">Deleted</option>
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
              onClick={() => {
                setSearch('');
                setCommunityFilter('All');
                setStatusFilter('All');
                setSortOrder('newest');
              }}
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
                    <th className="py-4 px-4 font-semibold text-white/90">Content</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Date</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Engagement</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Status</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, index) => (
                    <PostRow key={post.id} post={post} index={index} />
                  ))}
                  {filteredPosts.length === 0 && (
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
        {(viewMode === 'grid' || isMobile) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
            {filteredPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full bg-black/30 backdrop-blur-md rounded-xl p-10 border border-white/10 text-center"
              >
                <DocumentTextIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl text-white font-medium mb-2">No posts found</h3>
                <p className="text-white/60">Try adjusting your search or filters to find what you're looking for.</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-between items-center mt-8 text-white/80"
          >
            <div className="text-sm">
              Showing <span className="font-medium">{filteredPosts.length}</span> of <span className="font-medium">{mockPosts.length}</span> posts
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
      </main>
    </div>
  );
}

// This component is needed due to previous reference but not defined
// Adding it here to avoid errors
const PlayIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);
