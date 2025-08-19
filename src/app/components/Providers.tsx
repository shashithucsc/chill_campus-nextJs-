'use client';

import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from '@/contexts/SocketContext';

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
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}
