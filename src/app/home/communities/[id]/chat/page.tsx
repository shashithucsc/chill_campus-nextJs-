'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Navbar from '../../../navbar/Navbar';
import Sidebar from '../../../sidebar/Sidebar';
import MessagingUI from '../../../components/MessagingUI';
import { useSidebar } from '../../../context/SidebarContext';

export default function CommunityMessagingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { isCollapsed } = useSidebar();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch community data to verify membership
  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${id}`);
      const data = await response.json();
      setCommunity(data.community);
      
      // If user is not a member, redirect back
      if (!data.community?.isMember) {
        router.push(`/home/communities/${id}`);
      }
    } catch (error) {
      console.error('Error fetching community:', error);
      router.push('/home/communities');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/home/communities');
      }
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  const handleBack = () => {
    router.push(`/home/communities/${id}`);
  };

  useEffect(() => {
    if (id && session) {
      fetchCommunity();
    }
  }, [id, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
            <div className="flex items-center justify-center h-96">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          {/* Mobile back button */}
          <div className="md:hidden sticky top-16 z-10 bg-black/30 backdrop-blur-xl border-b border-white/10 p-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-all"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Community</span>
            </button>
          </div>

          {/* Messaging UI */}
          <div className="h-[calc(100vh-4rem)]">
            {community && (
              <MessagingUI
                community={community}
                onLeaveGroup={handleLeaveCommunity}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
