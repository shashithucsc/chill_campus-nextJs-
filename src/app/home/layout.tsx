'use client';

import { SidebarProvider } from './context/SidebarContext';
import { ChatProvider } from './context/ChatContext';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </SidebarProvider>
  );
}
