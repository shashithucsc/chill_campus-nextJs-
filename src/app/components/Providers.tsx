'use client';

import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60}  // Refresh session every 5 minutes
      refetchOnWindowFocus={true}  // Refresh session when window is focused
    >
      <SocketProvider>
        <Toaster position="top-right" />
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}
