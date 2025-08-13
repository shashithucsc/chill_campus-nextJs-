'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect from /home to /home/home
    router.replace('/home/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}>
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold">Loading your dashboard...</h2>
      </div>
    </div>
  );
}
