'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import CreateCommunityForm from '../../components/CreateCommunityForm';
import AnimatedBackground from '../components/AnimatedBackground';
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
        <AnimatedBackground 
          particleCount={8} 
          glassParticleCount={12}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        />
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
