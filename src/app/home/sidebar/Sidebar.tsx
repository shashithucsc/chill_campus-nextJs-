'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const [isCommunitiesExpanded, setIsCommunitiesExpanded] = useState(true);
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);

  const navigation = [
    { name: 'Home', href: '/home/home', icon: HomeIcon },
    { name: 'Communities', href: '/home/communities', icon: UserGroupIcon },
    { name: 'Events', href: '/home/events', icon: CalendarDaysIcon },
    { name: 'Messages', href: '/home/messages', icon: ChatBubbleLeftRightIcon },
  ];

  const communities = [
    { name: 'Computer Science', members: 1234, image: '/cs-logo.png' },
    { name: 'Engineering', members: 856, image: '/eng-logo.png' },
    { name: 'Business', members: 567, image: '/business-logo.png' },
  ];

  const upcomingEvents = [
    { name: 'Tech Workshop', date: 'Tomorrow, 2 PM', image: '/event1.png' },
    { name: 'Career Fair', date: 'Next Week', image: '/event2.png' },
  ];

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as any }}
      className="w-64 bg-white/95 backdrop-blur-md h-screen fixed left-0 top-16 border-r border-blue-100/20 overflow-y-auto shadow-lg"
    >
      <div className="p-6">
        {/* Main Navigation */}
        <nav className="space-y-2">
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
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 group"
                >
                  <IconComponent className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Communities Section */}
        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsCommunitiesExpanded(!isCommunitiesExpanded)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            <span>Communities</span>
            <motion.div
              animate={{ rotate: isCommunitiesExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="h-5 w-5 text-blue-600" />
            </motion.div>
          </motion.button>
          {isCommunitiesExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 space-y-2"
            >
              {communities.map((community, index) => (
                <motion.div
                  key={community.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                >
                  <Link
                    href={`/home/communities/${community.name.toLowerCase()}`}
                    className="flex items-center px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
                      <span className="text-white text-sm font-bold">
                        {community.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{community.name}</p>
                      <p className="text-xs text-gray-500">{community.members.toLocaleString()} members</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsEventsExpanded(!isEventsExpanded)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            <span>Upcoming Events</span>
            <motion.div
              animate={{ rotate: isEventsExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="h-5 w-5 text-blue-600" />
            </motion.div>
          </motion.button>
          {isEventsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 space-y-2"
            >
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                >
                  <Link
                    href={`/home/events/${event.name.toLowerCase().replace(' ', '-')}`}
                    className="flex items-center px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
                      <CalendarDaysIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.name}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100/20">
          <h3 className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg hover:bg-white/50 transition-all duration-300"
            >
              🎓 Join Study Groups
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg hover:bg-white/50 transition-all duration-300"
            >
              🏢 Explore Clubs
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 rounded-lg hover:bg-white/50 transition-all duration-300"
            >
              📚 Find Resources
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 