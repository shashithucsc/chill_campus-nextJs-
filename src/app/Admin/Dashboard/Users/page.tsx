'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  MagnifyingGlassIcon,
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

// Define the type for user data - matches our backend API
interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'student' | 'community admin' | 'community moderator';
  status: 'Active' | 'Suspended';
  createdAt: string;
  avatar?: string;
  university: string;
  isActive: boolean;
}

// Interface for the display layer
interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Community Admin' | 'Community Moderator';
  status: 'Active' | 'Suspended';
  joined: string;
  avatar: string;
}

// Transform backend user to display user
const transformUser = (user: User): DisplayUser => ({
  id: user._id,
  name: user.fullName,
  email: user.email,
  role: user.role === 'student' ? 'Student' : 
        user.role === 'community admin' ? 'Community Admin' : 'Community Moderator',
  status: user.status,
  joined: user.createdAt,
  avatar: user.avatar || ''
});

// User Row component for table
const UserRow = ({ user, index, onStatusToggle, onDelete }: { 
  user: DisplayUser, 
  index: number,
  onStatusToggle: (userId: string) => void,
  onDelete: (userId: string) => void
}) => {
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
          user.role === 'Community Admin' 
            ? 'bg-purple-500/20 text-purple-300' 
            : user.role === 'Community Moderator' 
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
            onClick={() => onStatusToggle(user.id)}
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
            onClick={() => onDelete(user.id)}
          >
            <TrashIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
};

// Mobile User Card component for responsive design
const UserCard = ({ user, index, onStatusToggle, onDelete }: { 
  user: DisplayUser, 
  index: number,
  onStatusToggle: (userId: string) => void,
  onDelete: (userId: string) => void
}) => {
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
          user.role === 'Community Admin' 
            ? 'text-purple-300' 
            : user.role === 'Community Moderator' 
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
          onClick={() => onStatusToggle(user.id)}
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
          onClick={() => onDelete(user.id)}
        >
          <TrashIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (userId: string) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;

      const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Update local state
      setUsers(users.map(u => 
        u._id === userId ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      // You could add a toast notification here
    }
  };

  // Handle user creation
  const handleCreateUser = async (userData: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    university: string;
  }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser.user]);
      setShowAddUserModal(false);
    } catch (err) {
      console.error('Error creating user:', err);
      throw err; // Re-throw to handle in modal
    }
  };

  // Handle user deletion
  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Update local state
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      // You could add a toast notification here
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

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
    const displayUsers = users.map(transformUser);
    let results = displayUsers;
    
    if (search) {
      results = results.filter((user: DisplayUser) => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (roleFilter !== 'All') {
      results = results.filter((user: DisplayUser) => user.role === roleFilter);
    }
    
    if (statusFilter !== 'All') {
      results = results.filter((user: DisplayUser) => user.status === statusFilter);
    }
    
    setFilteredUsers(results);
  }, [users, search, roleFilter, statusFilter]);

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
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">All Registered Users</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all text-sm font-medium"
              onClick={() => setShowAddUserModal(true)}
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
                <option value="Student">Student</option>
                <option value="Community Admin">Community Admin</option>
                <option value="Community Moderator">Community Moderator</option>
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/60">Loading users...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-red-400">{error}</td>
                  </tr>
                ) : (
                  <>
                    {filteredUsers.map((user, index) => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        index={index} 
                        onStatusToggle={handleStatusToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                    {filteredUsers.length === 0 && !loading && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-white/60">No users found matching your filters</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* User Cards (Mobile) */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="py-8 text-center text-white/60 bg-black/30 backdrop-blur-md rounded-xl p-4">
              Loading users...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-400 bg-black/30 backdrop-blur-md rounded-xl p-4">
              {error}
            </div>
          ) : (
            <>
              {filteredUsers.map((user, index) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  index={index} 
                  onStatusToggle={handleStatusToggle}
                  onDelete={handleDelete}
                />
              ))}
              {filteredUsers.length === 0 && !loading && (
                <div className="py-8 text-center text-white/60 bg-black/30 backdrop-blur-md rounded-xl p-4">
                  No users found matching your filters
                </div>
              )}
            </>
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
            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
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

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <AddUserModal 
            onClose={() => setShowAddUserModal(false)}
            onSubmit={handleCreateUser}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// Add User Modal Component
const AddUserModal = ({ 
  onClose, 
  onSubmit 
}: { 
  onClose: () => void, 
  onSubmit: (userData: any) => Promise<void> 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    university: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.university) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add New User</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all"
          >
            <XCircleIcon className="h-6 w-6 text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-black/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-black/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-black/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-black/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <option value="student">Student</option>
              <option value="community_admin">Community Admin</option>
              <option value="community_moderator">Community Moderator</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              University
            </label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/20 bg-black/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              placeholder="Enter university"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
