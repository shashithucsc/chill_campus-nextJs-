'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useSidebar } from '../context/SidebarContext';
import { useChat } from '../context/ChatContext';

export default function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { toggleChat, isChatOpen } = useChat();

  const navigation = [
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Communities', href: '/home/communities', icon: UserGroupIcon },
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isCollapsed ? '0px' : '256px'
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-white/10 backdrop-blur-md h-screen fixed left-0 top-16 border-r border-white/20 shadow-2xl z-40 overflow-hidden`}
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-64"
            >
              {/* Main Navigation */}
              <div className="p-6">
                <nav className="space-y-3">
                  {navigation.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center px-6 py-4 text-lg font-medium text-white/90 rounded-xl hover:bg-white/20 hover:text-white transition-all duration-300 group backdrop-blur-sm"
                        >
                          <IconComponent className="mr-4 h-6 w-6 text-white/70 group-hover:text-blue-400 transition-colors" />
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Chat Button */}
              <div className="px-6 mb-6">
                <motion.button
                  onClick={toggleChat}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: navigation.length * 0.1 }}
                  className={`flex items-center w-full px-6 py-4 text-lg font-medium rounded-xl transition-all duration-300 group backdrop-blur-sm ${
                    isChatOpen 
                      ? 'bg-blue-500/30 text-white border border-blue-400/30' 
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <ChatBubbleLeftIcon className={`mr-4 h-6 w-6 transition-colors ${
                    isChatOpen 
                      ? 'text-blue-400' 
                      : 'text-white/70 group-hover:text-blue-400'
                  }`} />
                  Messages
                  {/* Notification badge could go here if needed */}
                </motion.button>
              </div>

              {/* App Logo/Branding */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-white text-xl font-bold">CC</span>
                  </div>
                  <p className="text-xs text-white/60 font-medium">Chill Campus</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Toggle Button - positioned with margin from sidebar */}
      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          left: isCollapsed ? '16px' : '272px' // 16px margin from left when collapsed, 256px (sidebar width) + 16px margin when expanded
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-20 z-50 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-5 w-5" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5" />
        )}
      </motion.button>
    </>
  );
} 