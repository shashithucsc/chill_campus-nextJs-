'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import CreateCommunityForm from '../../components/CreateCommunityForm';
import { useSidebar } from '../../context/SidebarContext';

export default function CreateCommunityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only redirect if we're definitely not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/home/communities/create');
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status, router]);

  // Show loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1],
                delay: Math.random() * 3
              }}
              className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
          
          {/* Glass particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <Navbar />
      <Sidebar />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          paddingLeft: isCollapsed ? '0px' : '256px'
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 pt-24 px-6 pb-16"
      >
        <CreateCommunityForm />
      </motion.main>
    </div>
  );
}
