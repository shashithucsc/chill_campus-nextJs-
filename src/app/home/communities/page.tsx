'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Sample data - In a real app, this would come from an API
const communities = [
  {
    id: '1',
    name: 'Computer Science',
    description: 'A community for CS students to share knowledge, projects, and opportunities.',
    members: 1234,
    image: '/cs-logo.png',
    tags: ['Programming', 'Technology', 'Research'],
  },
  {
    id: '2',
    name: 'Engineering',
    description: 'Connect with fellow engineering students and discuss projects.',
    members: 856,
    image: '/eng-logo.png',
    tags: ['Mechanical', 'Electrical', 'Civil'],
  },
  {
    id: '3',
    name: 'Business',
    description: 'Network with business students and share industry insights.',
    members: 567,
    image: '/business-logo.png',
    tags: ['Marketing', 'Finance', 'Management'],
  },
  // Add more sample communities as needed
];

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === '' || community.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(communities.flatMap((community) => community.tags)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Community
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search communities..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedTag === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedTag('')}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Link
              key={community.id}
              href={`/home/communities/${community.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 relative">
                <Image
                  src={community.image}
                  alt={community.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{community.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{community.members} members</span>
                  <div className="flex gap-2">
                    {community.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {community.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{community.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 