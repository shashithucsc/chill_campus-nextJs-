'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UsersIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  PhotoIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Settings sections data
const settingsSections = [
  {
    id: "system",
    title: "System Configuration",
  icon: Cog6ToothIcon,
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
  icon: ArrowPathIcon,
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
const SettingCard = ({ 
  section, 
  index, 
  settings, 
  onSettingChange, 
  onLogoUpload, 
  uploadingLogo, 
  fileInputRef 
}: { 
  section: any; 
  index: number;
  settings: Record<string, any>;
  onSettingChange: (key: string, value: any) => void;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingLogo: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSettingValue = (settingId: string) => {
    // Change UI names to server names
    const keyMap: Record<string, string> = {
      'maintenance': 'maintenance_mode',
      'theme': 'theme_mode',
      'language': 'default_language',
      'logo': 'site_logo',
      'registration': 'allow_registration',
      'verification': 'account_verification',
      'default_role': 'default_user_role',
      'password_length': 'password_min_length',
      'password_complexity': 'password_requirements',
      'two_factor': 'require_2fa',
      'session_timeout': 'session_timeout',
      'email_notifications': 'email_notifications',
      'push_notifications': 'push_notifications',
      'notification_events': 'notification_events',
      'auto_backup': 'auto_backup',
      'backup_retention': 'backup_retention',
      'export_format': 'export_format'
    };

    const backendKey = keyMap[settingId] || settingId;
    return settings[backendKey];
  };

  const handleSettingChange = (settingId: string, value: any) => {
    // Change UI names to server names
    const keyMap: Record<string, string> = {
      'maintenance': 'maintenance_mode',
      'theme': 'theme_mode',
      'language': 'default_language',
      'logo': 'site_logo',
      'registration': 'allow_registration',
      'verification': 'account_verification',
      'default_role': 'default_user_role',
      'password_length': 'password_min_length',
      'password_complexity': 'password_requirements',
      'two_factor': 'require_2fa',
      'session_timeout': 'session_timeout',
      'email_notifications': 'email_notifications',
      'push_notifications': 'push_notifications',
      'notification_events': 'notification_events',
      'auto_backup': 'auto_backup',
      'backup_retention': 'backup_retention',
      'export_format': 'export_format'
    };

    const backendKey = keyMap[settingId] || settingId;
    onSettingChange(backendKey, value);
  };

  const handleMultiselectChange = (settingId: string, option: string) => {
    const currentValue = getSettingValue(settingId) || [];
    const newValue = currentValue.includes(option)
      ? currentValue.filter((item: string) => item !== option)
      : [...currentValue, option];
    handleSettingChange(settingId, newValue);
  };

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
                          checked={getSettingValue(setting.id) || false}
                          onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500/30"></div>
                      </div>
                    ) : setting.type === "select" ? (
                      <select 
                        className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        value={getSettingValue(setting.id) || setting.options[0].toLowerCase().replace(' ', '_')}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                      >
                        {setting.options.map((option: string) => (
                          <option key={option} value={option.toLowerCase().replace(' ', '_')}>
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
                        value={getSettingValue(setting.id) || setting.min || 8}
                        onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                      />
                    ) : setting.type === "file" ? (
                      <div className="flex items-center space-x-3">
                        {getSettingValue(setting.id) && (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                            <Image
                              src={getSettingValue(setting.id)}
                              alt="Current logo"
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <button 
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-all flex items-center disabled:opacity-50"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? (
                            <>
                              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <PhotoIcon className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </button>
                        <input
                          ref={fileInputRef as React.RefObject<HTMLInputElement>}
                          type="file"
                          accept="image/*"
                          onChange={onLogoUpload}
                          className="hidden"
                        />
                      </div>
                    ) : setting.type === "multiselect" ? (
                      <div className="flex flex-wrap gap-2">
                        {setting.options.map((option: string) => {
                          const isSelected = (getSettingValue(setting.id) || []).includes(option.toLowerCase());
                          return (
                            <button
                              key={option}
                              onClick={() => handleMultiselectChange(setting.id, option.toLowerCase())}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                isSelected 
                                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' 
                                  : 'bg-white/10 hover:bg-white/20 text-white/80'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
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
  const { data: session } = useSession();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({});
  
  // File upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load settings when page opens
  useEffect(() => {
    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  // See if anything changed
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      if (data.success) {
        const settingsValues = Object.keys(data.settings).reduce((acc: any, key) => {
          acc[key] = data.settings[key].value;
          return acc;
        }, {});
        
        setSettings(settingsValues);
        setOriginalSettings(settingsValues);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToastMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Only send what changed
      const changedSettings: Record<string, any> = {};
      Object.keys(settings).forEach(key => {
        if (settings[key] !== originalSettings[key]) {
          changedSettings[key] = settings[key];
        }
      });

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: changedSettings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      if (data.success) {
        setOriginalSettings(settings);
        setHasChanges(false);
        showToastMessage('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToastMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/admin/settings/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      if (data.success) {
        handleSettingChange('site_logo', data.url);
        showToastMessage('Logo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToastMessage('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <main className="pt-8 px-4 sm:px-8 pb-8 transition-all">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <Toast
            message={toastMessage}
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>

      <main className="pt-8 px-4 sm:px-8 pb-8 transition-all">
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
                disabled={saving}
                className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl font-medium transition-all flex items-center shadow-lg border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-6">
          {settingsSections.map((section, index) => (
            <SettingCard 
              key={section.id} 
              section={section} 
              index={index}
              settings={settings}
              onSettingChange={handleSettingChange}
              onLogoUpload={handleLogoUpload}
              uploadingLogo={uploadingLogo}
              fileInputRef={fileInputRef}
            />
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
    </>
  );
}
