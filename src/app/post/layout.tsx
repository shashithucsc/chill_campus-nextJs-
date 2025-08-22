'use client';

import { SidebarProvider } from '../home/context/SidebarContext';
import { ChatProvider } from '../home/context/ChatContext';
import { SocketProvider } from '@/contexts/SocketContext';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ChatProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ChatProvider>
    </SidebarProvider>
  );
}
