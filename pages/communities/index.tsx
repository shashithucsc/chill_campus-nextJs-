import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

// Mock data for communities
const mockCommunities = [
  {
    id: 1,
    name: 'Computer Science',
    description: 'A community for CS students to discuss programming, algorithms, and tech trends.',
    memberCount: 1234,
    university: 'University of Moratuwa',
    tags: ['Programming', 'Algorithms', 'Tech'],
  },
  {
    id: 2,
    name: 'Engineering Projects',
    description: 'Share and collaborate on engineering projects across universities.',
    memberCount: 856,
    university: 'University of Peradeniya',
    tags: ['Projects', 'Collaboration', 'Engineering'],
  },
  // Add more mock communities as needed
];

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');

  const filteredCommunities = mockCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUniversity = selectedUniversity === 'all' || community.university === selectedUniversity;
    return matchesSearch && matchesUniversity;
  });

  return (
    <Layout>
      <Head>
        <title>Communities - ChillCampus</title>
        <meta name="description" content="Join communities of students from different universities" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Communities
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/communities/create"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Community
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search communities..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
            >
              <option value="all">All Universities</option>
              <option value="University of Moratuwa">University of Moratuwa</option>
              <option value="University of Peradeniya">University of Peradeniya</option>
              <option value="University of Colombo">University of Colombo</option>
            </select>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{community.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{community.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {community.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">{community.memberCount} members</span>
                  <Link
                    href={`/communities/${community.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View Community →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 