'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar() {
  const [isCommunitiesExpanded, setIsCommunitiesExpanded] = useState(true);
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);

  const navigation = [
    { name: 'Home', href: '/home/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Communities', href: '/home/communities', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Events', href: '/home/events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Messages', href: '/home/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
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
    <div className="w-64 bg-white h-screen fixed left-0 top-16 border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
            >
              <svg
                className="mr-3 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Communities Section */}
        <div className="mt-8">
          <button
            onClick={() => setIsCommunitiesExpanded(!isCommunitiesExpanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
          >
            <span>Communities</span>
            <svg
              className={`h-5 w-5 text-gray-400 transform ${isCommunitiesExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isCommunitiesExpanded && (
            <div className="mt-2 space-y-2">
              {communities.map((community) => (
                <Link
                  key={community.name}
                  href={`/home/communities/${community.name.toLowerCase()}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                    <Image
                      src={community.image}
                      alt={community.name}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{community.name}</p>
                    <p className="text-xs text-gray-500">{community.members} members</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-8">
          <button
            onClick={() => setIsEventsExpanded(!isEventsExpanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
          >
            <span>Upcoming Events</span>
            <svg
              className={`h-5 w-5 text-gray-400 transform ${isEventsExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isEventsExpanded && (
            <div className="mt-2 space-y-2">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.name}
                  href={`/home/events/${event.name.toLowerCase().replace(' ', '-')}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                    <Image
                      src={event.image}
                      alt={event.name}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 