'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  UserIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  _id: string;
  type: 'user' | 'community' | 'post' | 'message';
  [key: string]: any;
}

interface SearchResponse {
  results: {
    posts: SearchResult[];
    users: SearchResult[];
    communities: SearchResult[];
    messages: SearchResult[];
    total: number;
  };
  query: string;
}

export default function SearchPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'users' | 'communities' | 'messages'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular'>('relevance');

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string, filter = activeFilter) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${filter}&limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/home/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    if (query) {
      performSearch(query, filter);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getFilteredResults = () => {
    if (!searchResults) return [];
    
    switch (activeFilter) {
      case 'posts': return searchResults.results.posts;
      case 'users': return searchResults.results.users;
      case 'communities': return searchResults.results.communities;
      case 'messages': return searchResults.results.messages;
      default: 
        return [
          ...searchResults.results.posts,
          ...searchResults.results.users,
          ...searchResults.results.communities,
          ...searchResults.results.messages
        ];
    }
  };

  const ResultCard = ({ result }: { result: SearchResult }) => {
    switch (result.type) {
      case 'post':
        return (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <Link href={`/home/posts/${result._id}`}>
              <div className="flex items-start space-x-4">
                <DocumentTextIcon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">Post Content</h3>
                  <p className="text-white/70 mb-3 line-clamp-3">{result.content}</p>
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <div className="flex items-center space-x-4">
                      <span>by {result.user?.fullName || 'Unknown User'}</span>
                      <span className="flex items-center">
                        <HeartIcon className="w-4 h-4 mr-1" />
                        {result.likesCount || 0}
                      </span>
                      <span className="flex items-center">
                        <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mr-1" />
                        {result.commentsCount || 0}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatTimeAgo(result.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-400">
                    Click to view individual post
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );

      case 'user':
        return (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <Link href="/home/profile">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {result.avatar ? (
                    <Image
                      src={result.avatar}
                      alt={result.fullName || 'User'}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {(result.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{result.fullName || 'Unknown User'}</h3>
                  <p className="text-white/60">{result.email || ''}</p>
                  {result.bio && (
                    <p className="text-white/50 text-sm mt-1 line-clamp-2">{result.bio}</p>
                  )}
                  <div className="mt-2 text-xs text-green-400">
                    Click to view profile page
                  </div>
                </div>
                <UserIcon className="w-6 h-6 text-blue-400" />
              </div>
            </Link>
          </motion.div>
        );

      case 'community':
        return (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <Link href={`/home/communities/${result._id}`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  {result.coverImage ? (
                    <Image
                      src={result.coverImage}
                      alt={result.name || 'Community'}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{result.name || 'Unknown Community'}</h3>
                  <p className="text-white/60">{result.memberCount || 0} members</p>
                  {result.description && (
                    <p className="text-white/50 text-sm mt-1 line-clamp-2">{result.description}</p>
                  )}
                </div>
                <UserGroupIcon className="w-6 h-6 text-purple-400" />
              </div>
            </Link>
          </motion.div>
        );

      case 'message':
        return (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <Link href={`/home/communities/${result.community?._id || ''}`}>
              <div className="flex items-start space-x-4">
                <ChatBubbleLeftIcon className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white/80 mb-2 line-clamp-3">{result.content || 'No content'}</p>
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <div className="flex items-center space-x-4">
                      <span>by {result.sender?.fullName || 'Unknown User'}</span>
                      <span>in {result.community?.name || 'Unknown Community'}</span>
                    </div>
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatTimeAgo(result.timestamp)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-green-400">
                    Click to view in community
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full px-6 py-3 pl-12 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/20 transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-3"
                >
                  <MagnifyingGlassIcon className="w-6 h-6 text-white/70" />
                </button>
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search Info */}
          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                Search Results for "{searchResults.query}"
              </h1>
              <p className="text-white/60">
                Found {searchResults.results.total} results
              </p>
            </motion.div>
          )}

          {/* Filters */}
          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'all', label: 'All', count: searchResults.results.total },
                  { key: 'posts', label: 'Posts', count: searchResults.results.posts.length },
                  { key: 'users', label: 'Users', count: searchResults.results.users.length },
                  { key: 'communities', label: 'Communities', count: searchResults.results.communities.length },
                  { key: 'messages', label: 'Messages', count: searchResults.results.messages.length },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => handleFilterChange(filter.key as typeof activeFilter)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      activeFilter === filter.key
                        ? 'bg-blue-500/30 text-white border border-blue-400/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div className="space-y-4">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60">Searching...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {filteredResults.map((result, index) => (
                  <motion.div
                    key={`${result.type}-${result._id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ResultCard result={result} />
                  </motion.div>
                ))}
              </motion.div>
            ) : searchResults ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-white/60">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Start searching</h3>
                <p className="text-white/60">
                  Enter a search term to find posts, users, communities, and messages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
