'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  BellIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Navbar({ onCreatePost }: { onCreatePost?: () => void }) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setUser({
            ...data.user,
            avatar: data.user.avatar || '/default-avatar.png',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setUser(null);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white/10 backdrop-blur-md shadow-2xl border-b border-white/20 fixed w-full z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Search */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 flex items-center"
            >
              <Link href="/home/home" className="flex items-center space-x-3">
                <div className="relative w-10 h-10">
                  <Image
                    src="/logo.png"
                    alt="Chill Campus Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Chill Campus
                </span>
              </Link>
            </motion.div>
            <div className="hidden md:block ml-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts, communities, or events..."
                  className="w-96 px-4 py-3 pl-12 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-3 top-3.5"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-white/70" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right side - Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Create Post Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-2xl hover:shadow-xl transition-all duration-300 border border-white/20"
              onClick={onCreatePost}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Post
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-3 rounded-xl hover:bg-white/20 focus:outline-none transition-all duration-300 relative backdrop-blur-sm"
              >
                <BellIcon className="h-6 w-6 text-white/80 hover:text-white transition-colors" />
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg"
                />
              </motion.button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 py-2 z-50"
                >
                  <div className="px-6 py-3 border-b border-white/20">
                    <h3 className="text-sm font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Sample notifications */}
                    <motion.div 
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      className="px-6 py-4 transition-colors"
                    >
                      <p className="text-sm text-white font-medium">New comment on your post</p>
                      <p className="text-xs text-white/60 mt-1">2 minutes ago</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      className="px-6 py-4 transition-colors"
                    >
                      <p className="text-sm text-white font-medium">Event reminder: Campus Meetup</p>
                      <p className="text-xs text-white/60 mt-1">1 hour ago</p>
                    </motion.div>
                  </div>
                  <div className="px-6 py-3 border-t border-white/20">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      className="text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold hover:from-blue-300 hover:to-purple-300"
                    >
                      View all notifications
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-0.5 shadow-lg">
                  <div className="h-full w-full rounded-full bg-white/10 backdrop-blur-sm p-0.5 border border-white/20">
                    <Image
                      src={user?.avatar || '/default-avatar.png'}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <span className="hidden md:block text-sm font-semibold text-white/90">
                  {loading ? 'Loading...' : (user?.fullName || 'Guest')}
                </span>
              </motion.button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 py-2 z-50"
                >
                  <motion.div whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                    <Link href="/home/profile" className="flex items-center px-6 py-3 text-sm text-white/90 hover:text-white font-medium transition-colors">
                      <UserIcon className="w-5 h-5 mr-3 text-blue-400" />
                      Your Profile
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                    <Link href="/home/settings" className="flex items-center px-6 py-3 text-sm text-white/90 hover:text-white font-medium transition-colors">
                      <Cog6ToothIcon className="w-5 h-5 mr-3 text-blue-400" />
                      Settings
                    </Link>
                  </motion.div>
                  <div className="border-t border-white/20 mt-2 pt-2">
                    <motion.button 
                      whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-6 py-3 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-400" />
                      Sign out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}