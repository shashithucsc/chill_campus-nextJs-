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
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

// Define the type for user data
interface User {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Organizer' | 'Admin';
  status: 'Active' | 'Suspended';
  joined: string;
  avatar: string;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@chillcampus.edu',
    role: 'Admin',
    status: 'Active',
    joined: '2025-01-15',
    avatar: '/uploads/683f0d865a3fc6817b6ca1cf-avatar.jpg'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@chillcampus.edu',
    role: 'Organizer',
    status: 'Active',
    joined: '2025-02-20',
    avatar: '/uploads/6846aec43f81033dbb04da7b-avatar.jpg'
  },
  {
    id: '3',
    name: 'Charlie Davis',
    email: 'charlie@chillcampus.edu',
    role: 'User',
    status: 'Suspended',
    joined: '2025-03-10',
    avatar: '/uploads/68551cbb981126d63000ced3-avatar.jpg'
  },
  {
    id: '4',
    name: 'Diana Miller',
    email: 'diana@chillcampus.edu',
    role: 'User',
    status: 'Active',
    joined: '2025-03-15',
    avatar: '/uploads/6857d2c9c069b2b51f421993-avatar.jpg'
  },
  {
    id: '5',
    name: 'Ethan Wilson',
    email: 'ethan@chillcampus.edu',
    role: 'Organizer',
    status: 'Active',
    joined: '2025-04-01',
    avatar: '/uploads/687606e956d069cefd283ca1-avatar.jpg'
  },
  {
    id: '6',
    name: 'Fiona Campbell',
    email: 'fiona@chillcampus.edu',
    role: 'User',
    status: 'Active',
    joined: '2025-04-10',
    avatar: ''
  },
  {
    id: '7',
    name: 'George Brown',
    email: 'george@chillcampus.edu',
    role: 'User',
    status: 'Active',
    joined: '2025-05-05',
    avatar: ''
  },
  {
    id: '8',
    name: 'Hannah Lee',
    email: 'hannah@chillcampus.edu',
    role: 'User',
    status: 'Suspended',
    joined: '2025-05-20',
    avatar: ''
  },
];

const navLinks = [
  { name: "Overview", icon: HomeIcon, href: "/Admin/Dashboard" },
  { name: "Users", icon: UsersIcon, href: "/Admin/Dashboard/Users" },
  { name: "Communities", icon: RectangleGroupIcon, href: "#" },
  { name: "Posts", icon: DocumentTextIcon, href: "#" },
  { name: "Reports", icon: ExclamationTriangleIcon, href: "#" },
  { name: "Settings", icon: Cog6ToothIcon, href: "#" },
];

// User Row component for table
const UserRow = ({ user, index }: { user: User, index: number }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`${index % 2 === 0 ? 'bg-black/20' : 'bg-black/10'} hover:bg-white/10 transition-all`}
    >
      <td className="py-4 px-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-3">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.name} width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-6 w-6 text-white/70" />
          )}
        </div>
        <span className="font-medium text-white">{user.name}</span>
      </td>
      <td className="py-4 px-4 text-white/80">{user.email}</td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          user.role === 'Admin' 
            ? 'bg-purple-500/20 text-purple-300' 
            : user.role === 'Organizer' 
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-gray-500/20 text-gray-300'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`flex items-center ${
          user.status === 'Active' ? 'text-green-400' : 'text-red-400'
        }`}>
          {user.status === 'Active' 
            ? <><CheckCircleIcon className="h-5 w-5 mr-1" /> Active</> 
            : <><XCircleIcon className="h-5 w-5 mr-1" /> Suspended</>}
        </span>
      </td>
      <td className="py-4 px-4 text-white/70">
        {new Date(user.joined).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </td>
      <td className="py-4 px-4">
        <div className="flex space-x-2">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-all"
            title="View Profile"
          >
            <EyeIcon className="h-5 w-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full ${
              user.status === 'Active' 
                ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300' 
                : 'bg-green-500/20 hover:bg-green-500/40 text-green-300'
            } transition-all`}
            title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
          >
            {user.status === 'Active' 
              ? <XCircleIcon className="h-5 w-5" />
              : <CheckCircleIcon className="h-5 w-5" />
            }
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
            title="Delete User"
          >
            <TrashIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
};

// Mobile User Card component for responsive design
const UserCard = ({ user, index }: { user: User, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg mb-4"
    >
      <div className="flex items-center mb-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-3">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.name} width={48} height={48} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-7 w-7 text-white/70" />
          )}
        </div>
        <div>
          <div className="font-medium text-white">{user.name}</div>
          <div className="text-white/70 text-sm">{user.email}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="text-white/60">Role:</div>
        <div className={`${
          user.role === 'Admin' 
            ? 'text-purple-300' 
            : user.role === 'Organizer' 
              ? 'text-blue-300'
              : 'text-gray-300'
        }`}>{user.role}</div>
        
        <div className="text-white/60">Status:</div>
        <div className={`${user.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
          {user.status}
        </div>
        
        <div className="text-white/60">Joined:</div>
        <div className="text-white/80">
          {new Date(user.joined).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-all"
          title="View Profile"
        >
          <EyeIcon className="h-5 w-5" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 rounded-full ${
            user.status === 'Active' 
              ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300' 
              : 'bg-green-500/20 hover:bg-green-500/40 text-green-300'
          } transition-all`}
          title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
        >
          {user.status === 'Active' 
            ? <XCircleIcon className="h-5 w-5" />
            : <CheckCircleIcon className="h-5 w-5" />
          }
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
          title="Delete User"
        >
          <TrashIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
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

  // Filter users based on search, role, and status
  useEffect(() => {
    let results = mockUsers;
    
    if (search) {
      results = results.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (roleFilter !== 'All') {
      results = results.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'All') {
      results = results.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(results);
  }, [search, roleFilter, statusFilter]);

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
                    link.name === "Users" ? "bg-white/10 text-white" : ""
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
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">All Registered Users</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all text-sm font-medium"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New User
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
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300 shadow-lg"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-white/60 absolute right-4 top-3.5" />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Organizer">Organizer</option>
                <option value="User">User</option>
              </select>
              <FunnelIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
              <FunnelIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* User Table (Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl p-6 mb-6 hidden md:block"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/10">
                  <th className="py-4 px-4 font-semibold text-white">User</th>
                  <th className="py-4 px-4 font-semibold text-white">Email</th>
                  <th className="py-4 px-4 font-semibold text-white">Role</th>
                  <th className="py-4 px-4 font-semibold text-white">Status</th>
                  <th className="py-4 px-4 font-semibold text-white">Joined Date</th>
                  <th className="py-4 px-4 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <UserRow key={user.id} user={user} index={index} />
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/60">No users found matching your filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* User Cards (Mobile) */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))}
          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-white/60 bg-black/30 backdrop-blur-md rounded-xl p-4">
              No users found matching your filters
            </div>
          )}
        </div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-between items-center mt-6 text-white/80"
        >
          <div className="text-sm">
            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{mockUsers.length}</span> users
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
      </main>
    </div>
  );
}
