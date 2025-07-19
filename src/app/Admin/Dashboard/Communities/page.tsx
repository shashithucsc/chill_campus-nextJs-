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
  PencilSquareIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

// Define the type for community data
interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  status: 'Active' | 'Disabled';
  coverImage: string;
  tags: string[];
}

// Mock community data
const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Computer Science Club',
    description: 'A community for computer science enthusiasts to collaborate and learn together.',
    memberCount: 128,
    createdAt: '2025-01-10',
    status: 'Active',
    coverImage: '/uploads/1752221215022-j3no.jpeg',
    tags: ['Technology', 'Programming']
  },
  {
    id: '2',
    name: 'Art & Design Studio',
    description: 'Share your creative works and get inspired by fellow artists.',
    memberCount: 94,
    createdAt: '2025-02-15',
    status: 'Active',
    coverImage: '/uploads/1752133976371-io0.png',
    tags: ['Art', 'Design']
  },
  {
    id: '3',
    name: 'Sports Enthusiasts',
    description: 'For students who love sports and fitness activities on campus.',
    memberCount: 156,
    createdAt: '2025-02-28',
    status: 'Active',
    coverImage: '/uploads/1752134725259-k7pu.png',
    tags: ['Sports', 'Fitness']
  },
  {
    id: '4',
    name: 'Mathematics Forum',
    description: 'Discuss mathematical concepts, problems, and research.',
    memberCount: 73,
    createdAt: '2025-03-05',
    status: 'Disabled',
    coverImage: '/uploads/1752134349401-ebno.png',
    tags: ['Science', 'Mathematics']
  },
  {
    id: '5',
    name: 'Music Production',
    description: 'For students interested in creating and sharing music.',
    memberCount: 112,
    createdAt: '2025-03-20',
    status: 'Active',
    coverImage: '/uploads/1750578673157-mgtbza.mp4',
    tags: ['Music', 'Arts']
  },
  {
    id: '6',
    name: 'Entrepreneurship Network',
    description: 'Connect with fellow entrepreneurs and share business ideas.',
    memberCount: 87,
    createdAt: '2025-04-02',
    status: 'Active',
    coverImage: '/uploads/1751788489853-ip3vxz.jpg',
    tags: ['Business', 'Innovation']
  },
  {
    id: '7',
    name: 'Literature Club',
    description: 'Discuss books, poetry, and all things literary.',
    memberCount: 64,
    createdAt: '2025-04-15',
    status: 'Disabled',
    coverImage: '',
    tags: ['Literature', 'Arts']
  },
  {
    id: '8',
    name: 'Psychology Society',
    description: 'Explore the human mind and behavior through discussions and events.',
    memberCount: 92,
    createdAt: '2025-05-01',
    status: 'Active',
    coverImage: '/uploads/1750577439376-dvzo74.jpg',
    tags: ['Psychology', 'Science']
  },
];

const navLinks = [
  { name: "Overview", icon: HomeIcon, href: "/Admin/Dashboard" },
  { name: "Users", icon: UsersIcon, href: "/Admin/Dashboard/Users" },
  { name: "Communities", icon: RectangleGroupIcon, href: "/Admin/Dashboard/Communities" },
  { name: "Posts", icon: DocumentTextIcon, href: "#" },
  { name: "Reports", icon: ExclamationTriangleIcon, href: "#" },
  { name: "Settings", icon: Cog6ToothIcon, href: "#" },
];

// Community Card Component
const CommunityCard = ({ community, index }: { community: Community, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-lg overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Cover Image */}
      <div className="h-40 w-full relative overflow-hidden">
        {community.coverImage ? (
          <Image 
            src={community.coverImage} 
            alt={community.name} 
            fill 
            className="object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/public/images/default-community-banner.jpg";
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-purple-900/60 to-blue-900/60 flex items-center justify-center">
            <RectangleGroupIcon className="h-16 w-16 text-white/50" />
          </div>
        )}
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
          {community.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/80">
              {tag}
            </span>
          ))}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(mockCommunities);
  const [isMobile, setIsMobile] = useState(false);

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

  // Filter and sort communities
  useEffect(() => {
    let results = [...mockCommunities];
    
    // Apply search filter
    if (search) {
      results = results.filter(community => 
        community.name.toLowerCase().includes(search.toLowerCase()) || 
        community.description.toLowerCase().includes(search.toLowerCase()) ||
        community.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Apply status filter
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
  }, [search, statusFilter, sortOrder]);

  // Count active communities
  const activeCommunities = mockCommunities.filter(c => c.status === 'Active').length;

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
                    link.name === "Communities" ? "bg-white/10 text-white" : ""
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
          className="mb-8 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 p-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <RectangleGroupIcon className="h-8 w-8 text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">Manage Communities</h1>
              </div>
              <p className="text-white/70 mt-2">You are managing {activeCommunities} active communities out of {mockCommunities.length} total.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCommunities.map((community, index) => (
              <CommunityCard key={community.id} community={community} index={index} />
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

        {/* Pagination (Optional) */}
        {filteredCommunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-between items-center mt-8 text-white/80"
          >
            <div className="text-sm">
              Showing <span className="font-medium">{filteredCommunities.length}</span> of <span className="font-medium">{mockCommunities.length}</span> communities
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
