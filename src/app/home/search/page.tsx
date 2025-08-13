"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  UserIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

interface SearchResult {
  _id: string;
  type: 'user' | 'community' | 'post' | 'message';
  content?: string;
  user?: { fullName: string };
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  avatar?: string;
  fullName?: string;
  email?: string;
  bio?: string;
  name?: string;
  memberCount?: number;
  description?: string;
  coverImage?: string;
  sender?: { fullName: string };
  community?: { _id: string; name: string };
  timestamp?: string;
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
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'users' | 'communities' | 'messages'>('all');

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
      console.error("Error performing search:", error);
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
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getFilteredResults = () => {
    if (!searchResults) return [];
    switch (activeFilter) {
      case "posts": return searchResults.results.posts;
      case "users": return searchResults.results.users;
      case "communities": return searchResults.results.communities;
      case "messages": return searchResults.results.messages;
      default:
        return [
          ...searchResults.results.posts,
          ...searchResults.results.users,
          ...searchResults.results.communities,
          ...searchResults.results.messages,
        ];
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)" }}>
      <div className="w-full max-w-3xl mx-auto pt-24 px-4 pb-16">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search posts, users, communities, messages..."
            className="flex-1 px-4 py-3 rounded-l-xl bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-r-xl font-semibold transition-all border border-white/20"
            style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)", color: "white" }}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </form>

        {/* Filters */}
        {searchResults && (
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { key: "all", label: "All", count: searchResults.results.total },
              { key: "posts", label: "Posts", count: searchResults.results.posts.length },
              { key: "users", label: "Users", count: searchResults.results.users.length },
              { key: "communities", label: "Communities", count: searchResults.results.communities.length },
              { key: "messages", label: "Messages", count: searchResults.results.messages.length },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key as typeof activeFilter)}
                className={`px-4 py-2 rounded-xl font-medium transition-all border border-white/20 ${activeFilter === filter.key ? "text-white" : "text-white/70 bg-white/10 hover:bg-white/20 hover:text-white"}`}
                style={activeFilter === filter.key ? { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)" } : undefined}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {isSearching ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60">Searching...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <div key={result._id} className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                {/* Render result based on type */}
                {result.type === "post" && (
                  <Link href={`/home/posts/${result._id}`}>
                    <div className="flex items-start space-x-4">
                      <DocumentTextIcon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-2">Post Content</h3>
                        <p className="text-white/70 mb-3 line-clamp-3">{result.content}</p>
                        <div className="flex items-center justify-between text-sm text-white/50">
                          <div className="flex items-center space-x-4">
                            <span>by {result.user?.fullName || "Unknown User"}</span>
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
                            {formatTimeAgo(result.createdAt || "")}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-blue-400">Click to view individual post</div>
                      </div>
                    </div>
                  </Link>
                )}
                {result.type === "user" && (
                  <Link href="/home/profile">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {result.avatar ? (
                          <Image src={result.avatar} alt={result.fullName || "User"} width={48} height={48} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-semibold border border-white/20" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)" }}>
                            {(result.fullName || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{result.fullName || "Unknown User"}</h3>
                        <p className="text-white/60">{result.email || ""}</p>
                        {result.bio && (
                          <p className="text-white/50 text-sm mt-1 line-clamp-2">{result.bio}</p>
                        )}
                        <div className="mt-2 text-xs text-green-400">Click to view profile page</div>
                      </div>
                      <UserIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  </Link>
                )}
                {result.type === "community" && (
                  <Link href={`/home/communities/${result._id}`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden">
                        {result.coverImage ? (
                          <Image src={result.coverImage} alt={result.name || "Community"} width={48} height={48} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center border border-white/20" style={{ background: "linear-gradient(135deg, #16213e 0%, #1a1a2e 50%, #0f0f23 100%)" }}>
                            <UserGroupIcon className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{result.name || "Unknown Community"}</h3>
                        <p className="text-white/60">{result.memberCount || 0} members</p>
                        {result.description && (
                          <p className="text-white/50 text-sm mt-1 line-clamp-2">{result.description}</p>
                        )}
                      </div>
                      <UserGroupIcon className="w-6 h-6 text-purple-400" />
                    </div>
                  </Link>
                )}
                {result.type === "message" && (
                  <Link href={`/home/communities/${result.community?._id || ""}`}>
                    <div className="flex items-start space-x-4">
                      <ChatBubbleLeftIcon className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white/80 mb-2 line-clamp-3">{result.content || "No content"}</p>
                        <div className="flex items-center justify-between text-sm text-white/50">
                          <div className="flex items-center space-x-4">
                            <span>by {result.sender?.fullName || "Unknown User"}</span>
                            <span>in {result.community?.name || "Unknown Community"}</span>
                          </div>
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatTimeAgo(result.timestamp || "")}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-green-400">Click to view in community</div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))
          ) : searchResults ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-white/60">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Start searching</h3>
              <p className="text-white/60">Enter a search term to find posts, users, communities, and messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
