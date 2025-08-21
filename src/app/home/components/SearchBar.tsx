'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  UserIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

interface SearchSuggestion {
  type: 'user' | 'community' | 'post' | 'message';
  id: string;
  text: string;
  avatar?: string;
  category: string;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const performFullSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Navigate to search page instead of showing dropdown results
    router.push(`/home/search?q=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        performFullSearch(query);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowDropdown(false);
    
    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'user':
        router.push(`/home/profile/${suggestion.id}`);
        break;
      case 'community':
        router.push(`/home/communities/${suggestion.id}`);
        break;
      case 'post':
        router.push(`/home/posts/${suggestion.id}`);
        break;
      default:
        performFullSearch(suggestion.text);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return UserIcon;
      case 'community': return UserGroupIcon;
      case 'post': return DocumentTextIcon;
      case 'message': return ChatBubbleLeftIcon;
      default: return DocumentTextIcon;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search posts, communities, users..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/20 transition-all duration-300 shadow-lg text-sm"
        />
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => performFullSearch(query)}
          className="absolute left-3 top-2.5"
        >
          <MagnifyingGlassIcon className="h-4 w-4 text-white/70" />
        </motion.button>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-white/60 uppercase tracking-wider">
                Quick Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={`${suggestion.type}-${suggestion.id}`}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedIndex === index ? 'bg-white/10' : ''
                  }`}
                >
                  {suggestion.avatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={suggestion.avatar}
                        alt={suggestion.text}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20"
                         style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}>
                      {(() => {
                        const Icon = getResultIcon(suggestion.type);
                        return <Icon className="w-4 h-4 text-white" />;
                      })()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-white font-medium">{suggestion.text}</div>
                    <div className="text-white/60 text-xs">{suggestion.category}</div>
                  </div>
                </motion.div>
              ))}
              
              {query.length >= 2 && (
                <motion.div
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  onClick={() => performFullSearch(query)}
                  className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all border-t border-white/10 mt-2"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10"
                       style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}>
                    <MagnifyingGlassIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-blue-400 font-medium">
                    Search for "{query}"
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
