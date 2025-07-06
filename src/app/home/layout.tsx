'use client';

import { SidebarProvider } from './context/SidebarContext';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
