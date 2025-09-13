'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  RectangleGroupIcon,
  DocumentTextIcon,
  XMarkIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navLinks = [
   { name: "Home", icon: UsersIcon, href: "/Admin/Dashboard/" },
  { name: "Users", icon: UsersIcon, href: "/Admin/Dashboard/Users" },
  { name: "Communities", icon: RectangleGroupIcon, href: "/Admin/Dashboard/Communities" },
  { name: "Posts", icon: DocumentTextIcon, href: "/Admin/Dashboard/Posts" },
  { name: "Reports", icon: ExclamationTriangleIcon, href: "/Admin/Dashboard/Reports" },
  { name: "Settings", icon: Cog6ToothIcon, href: "/Admin/Dashboard/Settings" },
];


// ...existing code...

const recentActions = [
  { type: "User Registration", user: "Alice", time: "2m ago" },
  { type: "Community Created", user: "Bob", time: "10m ago" },
  { type: "Report Filed", user: "Charlie", time: "20m ago" },
  { type: "Post Deleted", user: "Admin", time: "30m ago" },
  { type: "User Registration", user: "David", time: "1h ago" },
];


export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force redirect
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 font-sans">
      {/* Glassy Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-black/30 backdrop-blur-xl shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-xl" />
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent tracking-tight">Admin Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <UserIcon className="h-7 w-7 text-white" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-black/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 py-2 z-50"
                  >
                    <button className="w-full flex items-center px-4 py-3 text-white/90 hover:bg-white/10 transition-all">
                      <Cog6ToothIcon className="h-5 w-5 mr-2" /> Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setSidebarOpen((v) => !v)}>
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || typeof window === "undefined" || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 shadow-xl z-20 hidden md:block"
          >
            <nav className="flex flex-col py-8 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center px-6 py-3 rounded-xl transition-all font-medium text-lg text-left no-underline ${
                      isActive
                        ? 'text-white bg-blue-500/20 border-r-4 border-blue-400'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <link.icon className="h-6 w-6 mr-3" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-4 sm:px-8 pb-8 transition-all">
        {children}
      </main>
    </div>
  );
}