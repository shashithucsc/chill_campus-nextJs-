'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  RectangleGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ServerIcon,
  CloudArrowDownIcon,
  KeyIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  PaintBrushIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

// Navigation links (consistent with other admin pages)
const navLinks = [
  { name: "Overview", icon: HomeIcon, href: "/Admin/Dashboard" },
  { name: "Users", icon: UsersIcon, href: "/Admin/Dashboard/Users" },
  { name: "Communities", icon: RectangleGroupIcon, href: "/Admin/Dashboard/Communities" },
  { name: "Posts", icon: DocumentTextIcon, href: "/Admin/Dashboard/Posts" },
  { name: "Reports", icon: ExclamationTriangleIcon, href: "/Admin/Dashboard/Reports" },
  { name: "Settings", icon: Cog6ToothIcon, href: "/Admin/Dashboard/Settings" },
];

// Settings sections data
const settingsSections = [
  {
    id: "system",
    title: "System Configuration",
    icon: ServerIcon,
    description: "Configure core system settings and appearance",
    settings: [
      {
        id: "maintenance",
        label: "Maintenance Mode",
        type: "toggle",
        description: "Enable to show maintenance page to all users",
      },
      {
        id: "theme",
        label: "Theme Mode",
        type: "select",
        options: ["Dark", "Light", "Auto"],
        description: "Set the default theme for all users",
      },
      {
        id: "language",
        label: "Default Language",
        type: "select",
        options: ["English", "Spanish", "French", "German"],
        description: "Set the default system language",
      },
      {
        id: "logo",
        label: "Site Logo",
        type: "file",
        description: "Upload your site logo (recommended size: 150x150px)",
      },
    ],
  },
  {
    id: "users",
    title: "User Management",
    icon: UsersIcon,
    description: "Configure user registration and roles",
    settings: [
      {
        id: "registration",
        label: "Allow User Registration",
        type: "toggle",
        description: "Enable or disable new user registrations",
      },
      {
        id: "verification",
        label: "Account Verification",
        type: "select",
        options: ["Email Verification", "Manual Approval", "None"],
        description: "Choose how new accounts are verified",
      },
      {
        id: "default_role",
        label: "Default User Role",
        type: "select",
        options: ["Student", "Moderator", "Contributor"],
        description: "Set the default role for new users",
      },
    ],
  },
  {
    id: "security",
    title: "Security Settings",
    icon: ShieldCheckIcon,
    description: "Manage security and authentication settings",
    settings: [
      {
        id: "password_length",
        label: "Minimum Password Length",
        type: "number",
        min: 8,
        max: 32,
        description: "Set minimum characters required for passwords",
      },
      {
        id: "password_complexity",
        label: "Password Requirements",
        type: "multiselect",
        options: ["Uppercase", "Numbers", "Symbols"],
        description: "Choose password complexity requirements",
      },
      {
        id: "two_factor",
        label: "Two-Factor Authentication",
        type: "toggle",
        description: "Require 2FA for all admin accounts",
      },
      {
        id: "session_timeout",
        label: "Session Timeout",
        type: "select",
        options: ["30 minutes", "1 hour", "4 hours", "8 hours"],
        description: "Set user session expiration time",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notification Settings",
    icon: BellIcon,
    description: "Configure system notifications and alerts",
    settings: [
      {
        id: "email_notifications",
        label: "System Email Notifications",
        type: "toggle",
        description: "Enable automated email notifications",
      },
      {
        id: "push_notifications",
        label: "Web Push Notifications",
        type: "toggle",
        description: "Enable browser push notifications",
      },
      {
        id: "notification_events",
        label: "Notification Events",
        type: "multiselect",
        options: ["New Users", "Reports", "Comments", "System Updates"],
        description: "Select events that trigger notifications",
      },
    ],
  },
  {
    id: "data",
    title: "Data Management",
    icon: CloudArrowDownIcon,
    description: "Manage system data and exports",
    settings: [
      {
        id: "auto_backup",
        label: "Automatic Backups",
        type: "toggle",
        description: "Enable daily automatic backups",
      },
      {
        id: "backup_retention",
        label: "Backup Retention",
        type: "select",
        options: ["7 days", "30 days", "90 days", "1 year"],
        description: "How long to keep automatic backups",
      },
      {
        id: "export_format",
        label: "Export Format",
        type: "select",
        options: ["JSON", "CSV", "SQL"],
        description: "Choose the default export format",
      },
    ],
  },
];

// Toast Component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 flex items-center bg-green-500/20 border border-green-500/30 backdrop-blur-md rounded-xl px-4 py-3 text-green-300 shadow-xl"
    >
      <CheckCircleIcon className="h-5 w-5 mr-2" />
      {message}
    </motion.div>
  );
};

// Setting Card Component
const SettingCard = ({ section, index }: { section: any; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-white/5 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-white/10">
              <section.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <p className="text-white/60 text-sm">{section.description}</p>
            </div>
          </div>
          <ChevronRightIcon 
            className={`h-5 w-5 text-white/60 transition-transform duration-300 ${
              isExpanded ? "rotate-90" : ""
            }`} 
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-6 space-y-6">
              {section.settings.map((setting: any) => (
                <div key={setting.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-medium">{setting.label}</label>
                    {setting.type === "toggle" ? (
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          onChange={() => console.log(`Toggle ${setting.id}`)}
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/30"></div>
                      </div>
                    ) : setting.type === "select" ? (
                      <select className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                        {setting.options.map((option: string) => (
                          <option key={option} value={option.toLowerCase()}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : setting.type === "number" ? (
                      <input
                        type="number"
                        min={setting.min}
                        max={setting.max}
                        className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white w-24 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    ) : setting.type === "file" ? (
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-all">
                        Upload
                      </button>
                    ) : setting.type === "multiselect" ? (
                      <div className="flex flex-wrap gap-2">
                        {setting.options.map((option: string) => (
                          <button
                            key={option}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-all"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <p className="text-white/60 text-sm">{setting.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Component
export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("system");
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving settings...");
    setShowToast(true);
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <Toast
            message="Settings saved successfully!"
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>

      {/* Glassy Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-black/30 backdrop-blur-xl shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/Admin/Dashboard">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-xl" />
            </Link>
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
                    <button className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/20 transition-all">
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={() => setSidebarOpen((v) => !v)}>
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
            className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 shadow-xl z-20 ${isMobile ? 'block' : 'hidden md:block'}`}
          >
            <nav className="flex flex-col py-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-6 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium text-lg ${
                    link.name === "Settings" ? "bg-white/10 text-white" : ""
                  }`}
                >
                  <link.icon className="h-6 w-6 mr-3" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-4 sm:px-8 pb-8 transition-all">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 p-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <Cog6ToothIcon className="h-8 w-8 text-blue-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
              </div>
              <p className="text-white/70 mt-2">Manage system preferences and configurations</p>
            </div>
            
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl font-medium transition-all flex items-center shadow-lg border border-blue-500/30"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Save Changes
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-6">
          {settingsSections.map((section, index) => (
            <SettingCard key={section.id} section={section} index={index} />
          ))}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/Admin/Dashboard/Reports"
              className="flex items-center p-4 bg-black/20 hover:bg-black/30 rounded-xl border border-white/10 transition-all group"
            >
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-400 mr-3" />
              <span className="text-white/80 group-hover:text-white">View System Logs</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-white/40 ml-auto" />
            </Link>
            
            <Link
              href="#"
              className="flex items-center p-4 bg-black/20 hover:bg-black/30 rounded-xl border border-white/10 transition-all group"
            >
              <DocumentDuplicateIcon className="h-6 w-6 text-blue-400 mr-3" />
              <span className="text-white/80 group-hover:text-white">Documentation</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-white/40 ml-auto" />
            </Link>
            
            <Link
              href="#"
              className="flex items-center p-4 bg-black/20 hover:bg-black/30 rounded-xl border border-white/10 transition-all group"
            >
              <ShieldCheckIcon className="h-6 w-6 text-green-400 mr-3" />
              <span className="text-white/80 group-hover:text-white">Security Center</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-white/40 ml-auto" />
            </Link>
            
            <Link
              href="#"
              className="flex items-center p-4 bg-black/20 hover:bg-black/30 rounded-xl border border-white/10 transition-all group"
            >
              <BellIcon className="h-6 w-6 text-purple-400 mr-3" />
              <span className="text-white/80 group-hover:text-white">Notification Rules</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-white/40 ml-auto" />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
