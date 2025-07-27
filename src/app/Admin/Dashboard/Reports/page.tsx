'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  FunnelIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  FlagIcon,
  BellIcon,
  NoSymbolIcon,
  XMarkIcon,
  PhotoIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

// Define report types
type ReportType = 'Post' | 'User' | 'Comment';
type ReportStatus = 'Pending' | 'Resolved' | 'Ignored';

interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  reason: string;
  description: string;
  reportedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  reportedContent: {
    id: string;
    text: string;
    image?: string;
    community: {
      id: string;
      name: string;
    };
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  };
  createdAt: string;
}

// Mock report data
const mockReports: Report[] = [
  {
    id: '1',
    type: 'Post',
    status: 'Pending',
    reason: 'Inappropriate Content',
    description: 'This post contains offensive material that violates community standards.',
    reportedBy: {
      id: '101',
      name: 'Sarah Johnson',
      avatar: '/uploads/683f0d865a3fc6817b6ca1cf-avatar.jpg'
    },
    reportedContent: {
      id: 'p1',
      text: 'This is a post containing inappropriate language and offensive content that should not be allowed according to community guidelines.',
      image: '/uploads/1752133976371-io0.png',
      community: {
        id: 'c1',
        name: 'Computer Science Club'
      },
      author: {
        id: 'u1',
        name: 'Bob Smith',
        avatar: '/uploads/6846aec43f81033dbb04da7b-avatar.jpg'
      }
    },
    createdAt: '2025-07-18T09:15:00'
  },
  {
    id: '2',
    type: 'User',
    status: 'Pending',
    reason: 'Harassment',
    description: 'This user has been sending threatening messages to multiple community members.',
    reportedBy: {
      id: '102',
      name: 'Michael Brown',
      avatar: ''
    },
    reportedContent: {
      id: 'u2',
      text: 'Profile repeatedly harassing other users across multiple communities.',
      community: {
        id: 'c2',
        name: 'Psychology Society'
      },
      author: {
        id: 'u2',
        name: 'Jack Wilson',
        avatar: ''
      }
    },
    createdAt: '2025-07-17T14:30:00'
  },
  {
    id: '3',
    type: 'Comment',
    status: 'Pending',
    reason: 'Spam',
    description: 'This comment appears to be advertising unrelated products with suspicious links.',
    reportedBy: {
      id: '103',
      name: 'Emily Davis',
      avatar: '/uploads/6857d2c9c069b2b51f421993-avatar.jpg'
    },
    reportedContent: {
      id: 'c1',
      text: 'Check out these amazing products at www.suspicious-link.com! Best deals guaranteed with 90% discount! Click now before offer expires!',
      community: {
        id: 'c3',
        name: 'Entrepreneurship Network'
      },
      author: {
        id: 'u3',
        name: 'Emma White',
        avatar: ''
      }
    },
    createdAt: '2025-07-16T16:45:00'
  },
  {
    id: '4',
    type: 'Post',
    status: 'Resolved',
    reason: 'Copyright Violation',
    description: 'This post contains copyrighted material posted without permission.',
    reportedBy: {
      id: '104',
      name: 'Daniel Lee',
      avatar: ''
    },
    reportedContent: {
      id: 'p2',
      text: 'Check out this amazing artwork I made!',
      image: '/uploads/1751788489853-ip3vxz.jpg',
      community: {
        id: 'c4',
        name: 'Art & Design Studio'
      },
      author: {
        id: 'u4',
        name: 'Chris Taylor',
        avatar: '/uploads/687606e956d069cefd283ca1-avatar.jpg'
      }
    },
    createdAt: '2025-07-15T10:20:00'
  },
  {
    id: '5',
    type: 'Comment',
    status: 'Ignored',
    reason: 'Misinformation',
    description: 'This comment contains factually incorrect information that may mislead others.',
    reportedBy: {
      id: '105',
      name: 'Olivia Martin',
      avatar: ''
    },
    reportedContent: {
      id: 'c2',
      text: 'Studies show that drinking cold water causes cancer and heart disease. Everyone should only drink warm water to stay healthy.',
      community: {
        id: 'c5',
        name: 'Health & Wellness'
      },
      author: {
        id: 'u5',
        name: 'Sophia Rodriguez',
        avatar: ''
      }
    },
    createdAt: '2025-07-14T13:50:00'
  },
  {
    id: '6',
    type: 'User',
    status: 'Resolved',
    reason: 'Impersonation',
    description: 'This user is pretending to be a faculty member and spreading false information.',
    reportedBy: {
      id: '106',
      name: 'James Wilson',
      avatar: ''
    },
    reportedContent: {
      id: 'u6',
      text: 'User profile claiming to be Dr. Robert Johnson, Department Chair.',
      community: {
        id: 'c1',
        name: 'Computer Science Club'
      },
      author: {
        id: 'u6',
        name: 'Fake Professor',
        avatar: ''
      }
    },
    createdAt: '2025-07-13T09:10:00'
  },
  {
    id: '7',
    type: 'Post',
    status: 'Pending',
    reason: 'Hate Speech',
    description: 'This post contains language targeting specific groups based on ethnicity.',
    reportedBy: {
      id: '107',
      name: 'Ava Thompson',
      avatar: ''
    },
    reportedContent: {
      id: 'p3',
      text: 'This post contains harmful language targeting specific ethnic groups that violates community guidelines.',
      community: {
        id: 'c6',
        name: 'Cultural Exchange Group'
      },
      author: {
        id: 'u7',
        name: 'Anonymous User',
        avatar: ''
      }
    },
    createdAt: '2025-07-12T15:30:00'
  },
  {
    id: '8',
    type: 'Comment',
    status: 'Pending',
    reason: 'Bullying',
    description: 'This comment specifically targets and mocks another student.',
    reportedBy: {
      id: '108',
      name: 'Noah Garcia',
      avatar: '/uploads/68551cbb981126d63000ced3-avatar.jpg'
    },
    reportedContent: {
      id: 'c3',
      text: "You\\'re so stupid, nobody likes your ideas. Everyone laughs at you behind your back.",
      community: {
        id: 'c7',
        name: 'Student Council'
      },
      author: {
        id: 'u8',
        name: 'Ryan Baker',
        avatar: ''
      }
    },
    createdAt: '2025-07-11T11:25:00'
  }
];

// Navigation links
const navLinks = [
  { name: "Overview", icon: HomeIcon, href: "/Admin/Dashboard" },
  { name: "Users", icon: UsersIcon, href: "/Admin/Dashboard/Users" },
  { name: "Communities", icon: RectangleGroupIcon, href: "/Admin/Dashboard/Communities" },
  { name: "Posts", icon: DocumentTextIcon, href: "/Admin/Dashboard/Posts" },
  { name: "Reports", icon: ExclamationTriangleIcon, href: "/Admin/Dashboard/Reports" },
  { name: "Settings", icon: Cog6ToothIcon, href: "#" },
];

// Status Badge Component
const StatusBadge = ({ status }: { status: ReportStatus }) => {
  let bgColor = '';
  let textColor = '';
  let icon = null;

  switch (status) {
    case 'Pending':
      bgColor = 'bg-amber-500/20';
      textColor = 'text-amber-300';
      icon = <BellIcon className="h-4 w-4 mr-1" />;
      break;
    case 'Resolved':
      bgColor = 'bg-green-500/20';
      textColor = 'text-green-300';
      icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
      break;
    case 'Ignored':
      bgColor = 'bg-gray-500/20';
      textColor = 'text-gray-300';
      icon = <XMarkIcon className="h-4 w-4 mr-1" />;
      break;
    default:
      bgColor = 'bg-blue-500/20';
      textColor = 'text-blue-300';
  }

  return (
    <span className={`flex items-center px-2 py-1 rounded-full text-sm ${bgColor} ${textColor} border border-${textColor.replace('text-', '')}/40`}>
      {icon}
      {status}
    </span>
  );
};

// Type Badge Component
const TypeBadge = ({ type }: { type: ReportType }) => {
  let bgColor = '';
  let textColor = '';
  let icon = null;

  switch (type) {
    case 'Post':
      bgColor = 'bg-blue-500/20';
      textColor = 'text-blue-300';
      icon = <DocumentTextIcon className="h-4 w-4 mr-1" />;
      break;
    case 'User':
      bgColor = 'bg-purple-500/20';
      textColor = 'text-purple-300';
      icon = <UserIcon className="h-4 w-4 mr-1" />;
      break;
    case 'Comment':
      bgColor = 'bg-cyan-500/20';
      textColor = 'text-cyan-300';
      icon = <ChatBubbleBottomCenterIcon className="h-4 w-4 mr-1" />;
      break;
    default:
      bgColor = 'bg-gray-500/20';
      textColor = 'text-gray-300';
  }

  return (
    <span className={`flex items-center px-2 py-1 rounded-full text-sm ${bgColor} ${textColor} border border-${textColor.replace('text-', '')}/40`}>
      {icon}
      {type}
    </span>
  );
};

// Report Card Component for Grid/Mobile View
const ReportCard = ({ report, index, onActionClick }: { report: Report, index: number, onActionClick: (action: string, report: Report) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`bg-black/30 backdrop-blur-md rounded-xl border ${
        report.status === 'Pending' ? 'border-amber-500/30' : 
        report.status === 'Resolved' ? 'border-green-500/30' : 'border-white/10'
      } shadow-lg p-4 hover:shadow-xl transition-all`}
    >
      {/* Report Header */}
      <div className="flex items-center justify-between mb-3">
        <TypeBadge type={report.type} />
        <StatusBadge status={report.status} />
      </div>
      
      {/* Reported Content Preview */}
      <div className="mb-4">
        <div className="text-sm text-white/80 mb-2 line-clamp-3">
          {report.reportedContent.text}
        </div>
        {report.reportedContent.image && (
          <div className="h-24 w-full relative rounded-lg overflow-hidden mb-2">
            <Image 
              src={report.reportedContent.image} 
              alt="Reported content" 
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Report Details */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-white font-medium text-sm">Reason: <span className="text-red-300">{report.reason}</span></div>
          <div className="text-white/60 text-xs mt-1">
            {new Date(report.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-1">
            {report.reportedContent.author.avatar ? (
              <Image src={report.reportedContent.author.avatar} alt={report.reportedContent.author.name} width={32} height={32} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-4 w-4 text-white/70" />
            )}
          </div>
        </div>
      </div>
      
      {/* Community Info */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center text-white/60 text-xs">
          <RectangleGroupIcon className="h-4 w-4 mr-1" />
          {report.reportedContent.community.name}
        </div>
        <div className="flex items-center text-white/60 text-xs">
          <FlagIcon className="h-4 w-4 mr-1" />
          Reported by: {report.reportedBy.name}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onActionClick('view', report)}
          className="flex items-center justify-center px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-all text-sm"
        >
          <EyeIcon className="h-4 w-4 mr-1.5" /> View Details
        </motion.button>
        
        {report.status === 'Pending' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onActionClick('resolve', report)}
            className="flex items-center justify-center px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition-all text-sm"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1.5" /> Resolve
          </motion.button>
        )}
        
        {report.status === 'Pending' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onActionClick('ignore', report)}
            className="flex items-center justify-center px-3 py-1.5 bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 rounded-lg transition-all text-sm"
          >
            <XMarkIcon className="h-4 w-4 mr-1.5" /> Ignore
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onActionClick('delete', report)}
          className="flex items-center justify-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all text-sm"
        >
          <TrashIcon className="h-4 w-4 mr-1.5" /> Delete Content
        </motion.button>
        
        {report.type === 'User' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onActionClick('block', report)}
            className="flex items-center justify-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all text-sm"
          >
            <NoSymbolIcon className="h-4 w-4 mr-1.5" /> Block User
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Report Table Row Component for Desktop View
const ReportRow = ({ report, index, onActionClick }: { report: Report, index: number, onActionClick: (action: string, report: Report) => void }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`${index % 2 === 0 ? 'bg-black/20' : 'bg-black/10'} ${
        report.status === 'Pending' ? 'border-l-2 border-amber-500/50' : 
        report.status === 'Resolved' ? 'border-l-2 border-green-500/50' : ''
      } hover:bg-white/5 transition-all`}
    >
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-3">
            {report.reportedBy.avatar ? (
              <Image src={report.reportedBy.avatar} alt={report.reportedBy.name} width={40} height={40} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-6 w-6 text-white/70" />
            )}
          </div>
          <div>
            <div className="font-medium text-white text-sm">{report.reportedBy.name}</div>
            <div className="flex items-center text-white/60 text-xs">
              <FlagIcon className="h-3 w-3 mr-1" />
              Reporter
            </div>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center space-x-1.5">
          <TypeBadge type={report.type} />
          <div className="text-white/80 text-sm">
            {report.reportedContent.author.name}
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div>
            <div className="text-white/80 text-sm font-medium">{report.reason}</div>
            <div className="text-white/60 text-xs mt-0.5 line-clamp-1">{report.description}</div>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="max-w-xs">
          <p className="text-white/80 text-sm line-clamp-2">
            {report.reportedContent.text}
          </p>
          {report.reportedContent.image && (
            <div className="flex items-center text-blue-300 text-xs mt-1">
              <PhotoIcon className="h-4 w-4 mr-1" />
              Has image attachment
            </div>
          )}
          <div className="text-white/60 text-xs mt-1 flex items-center">
            <RectangleGroupIcon className="h-3 w-3 mr-1" />
            {report.reportedContent.community.name}
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <div className="text-white/70 text-sm">
            {new Date(report.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="text-white/50 text-xs">
            {new Date(report.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4">
        <StatusBadge status={report.status} />
      </td>
      
      <td className="py-4 px-4">
        <div className="flex space-x-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onActionClick('view', report)}
            className="p-1.5 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-all"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </motion.button>
          
          {report.status === 'Pending' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onActionClick('resolve', report)}
              className="p-1.5 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-300 transition-all"
              title="Mark as Resolved"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </motion.button>
          )}
          
          {report.status === 'Pending' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onActionClick('ignore', report)}
              className="p-1.5 rounded-full bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 transition-all"
              title="Ignore Report"
            >
              <XMarkIcon className="h-4 w-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onActionClick('delete', report)}
            className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
            title="Delete Content"
          >
            <TrashIcon className="h-4 w-4" />
          </motion.button>
          
          {report.type === 'User' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onActionClick('block', report)}
              className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
              title="Block User"
            >
              <NoSymbolIcon className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// Report Detail Modal Component
const ReportDetailModal = ({ report, onClose }: { report: Report | null, onClose: () => void }) => {
  if (!report) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <TypeBadge type={report.type} />
              <StatusBadge status={report.status} />
            </div>
            <h3 className="text-xl font-bold text-white">Report Details</h3>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white/70 hover:text-white transition-all"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Report Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <h4 className="text-white/80 text-lg font-medium mb-3">Report Information</h4>
            
            <div className="space-y-3">
              <div>
                <div className="text-white/60 text-sm">Report Type</div>
                <div className="text-white font-medium">{report.type}</div>
              </div>
              
              <div>
                <div className="text-white/60 text-sm">Reason</div>
                <div className="text-red-300 font-medium">{report.reason}</div>
              </div>
              
              <div>
                <div className="text-white/60 text-sm">Description</div>
                <div className="text-white/80">{report.description}</div>
              </div>
              
              <div>
                <div className="text-white/60 text-sm">Reported On</div>
                <div className="text-white/80">
                  {new Date(report.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <h4 className="text-white/80 text-lg font-medium mb-3">People Involved</h4>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-3">
                  {report.reportedBy.avatar ? (
                    <Image src={report.reportedBy.avatar} alt={report.reportedBy.name} width={48} height={48} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-7 w-7 text-white/70" />
                  )}
                </div>
                <div>
                  <div className="text-white font-medium">{report.reportedBy.name}</div>
                  <div className="text-white/60 text-sm flex items-center">
                    <FlagIcon className="h-4 w-4 mr-1" /> Reporter
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 flex items-center justify-center overflow-hidden mr-3">
                  {report.reportedContent.author.avatar ? (
                    <Image src={report.reportedContent.author.avatar} alt={report.reportedContent.author.name} width={48} height={48} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-7 w-7 text-white/70" />
                  )}
                </div>
                <div>
                  <div className="text-white font-medium">{report.reportedContent.author.name}</div>
                  <div className="text-white/60 text-sm flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" /> Content Creator
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400/30 to-green-400/30 flex items-center justify-center overflow-hidden mr-3">
                  <RectangleGroupIcon className="h-7 w-7 text-white/70" />
                </div>
                <div>
                  <div className="text-white font-medium">{report.reportedContent.community.name}</div>
                  <div className="text-white/60 text-sm flex items-center">
                    <RectangleGroupIcon className="h-4 w-4 mr-1" /> Community
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reported Content */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-6">
          <h4 className="text-white/80 text-lg font-medium mb-3">Reported Content</h4>
          
          <div className="text-white/90 mb-4 p-3 bg-black/50 rounded-lg border border-white/5">
            {report.reportedContent.text}
          </div>
          
          {report.reportedContent.image && (
            <div className="h-48 w-full relative rounded-lg overflow-hidden mb-4">
              <Image 
                src={report.reportedContent.image} 
                alt="Reported content" 
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex items-center text-white/60 text-sm">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Originally posted in {report.reportedContent.community.name}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-end">
          {report.status === 'Pending' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-xl transition-all"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" /> Mark as Resolved
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 rounded-xl transition-all"
              >
                <XMarkIcon className="h-5 w-5 mr-2" /> Ignore Report
              </motion.button>
            </>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition-all"
          >
            <TrashIcon className="h-5 w-5 mr-2" /> Delete Content
          </motion.button>
          
          {report.type === 'User' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition-all"
            >
              <NoSymbolIcon className="h-5 w-5 mr-2" /> Block User
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Component
export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Count reports by status
  const pendingCount = mockReports.filter(r => r.status === 'Pending').length;
  const resolvedCount = mockReports.filter(r => r.status === 'Resolved').length;
  const ignoredCount = mockReports.filter(r => r.status === 'Ignored').length;
  
  // Filter reports
  useEffect(() => {
    let results = [...mockReports];
    
    // Apply search filter
    if (search) {
      results = results.filter(report => 
        report.reportedContent.text.toLowerCase().includes(search.toLowerCase()) ||
        report.reportedContent.author.name.toLowerCase().includes(search.toLowerCase()) ||
        report.reportedContent.community.name.toLowerCase().includes(search.toLowerCase()) ||
        report.reportedBy.name.toLowerCase().includes(search.toLowerCase()) ||
        report.reason.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'All') {
      results = results.filter(report => report.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      results = results.filter(report => report.status === statusFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    setFilteredReports(results);
  }, [search, typeFilter, statusFilter, sortOrder]);
  
  // Handle report actions
  const handleActionClick = (action: string, report: Report) => {
    if (action === 'view') {
      setSelectedReport(report);
    } else {
      // In a real app, we would handle these actions with API calls
      console.log(`${action} action on report ${report.id}`);
      
      // For demonstration purposes, show we would update the UI
      let updatedReports = [...filteredReports];
      const reportIndex = updatedReports.findIndex(r => r.id === report.id);
      
      if (reportIndex !== -1) {
        if (action === 'resolve' && report.status === 'Pending') {
          updatedReports[reportIndex] = { ...report, status: 'Resolved' };
        }
        else if (action === 'ignore' && report.status === 'Pending') {
          updatedReports[reportIndex] = { ...report, status: 'Ignored' };
        }
        
        setFilteredReports(updatedReports);
      }
    }
  };

  return (
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
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-400 mr-3" />
                <h1 className="text-2xl font-bold text-white">Manage Reports</h1>
              </div>
              <p className="text-white/70 mt-2">View and resolve reported content from users</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center">
                <BellIcon className="h-4 w-4 text-amber-300 mr-1.5" />
                <span className="text-amber-300 text-sm font-medium">{pendingCount} Pending</span>
              </div>
              <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-300 mr-1.5" />
                <span className="text-green-300 text-sm font-medium">{resolvedCount} Resolved</span>
              </div>
              <div className="px-3 py-1.5 bg-gray-500/20 border border-gray-500/30 rounded-xl flex items-center">
                <XMarkIcon className="h-4 w-4 text-gray-300 mr-1.5" />
                <span className="text-gray-300 text-sm font-medium">{ignoredCount} Ignored</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Status Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6 flex border border-white/10 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm"
        >
          <button 
            className={`flex-1 py-3 font-medium text-center transition-all ${statusFilter === 'All' 
              ? 'bg-blue-500/30 text-white shadow-lg' 
              : 'text-white/70 hover:bg-white/5'}`}
            onClick={() => setStatusFilter('All')}
          >
            All Reports
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-center transition-all ${statusFilter === 'Pending' 
              ? 'bg-amber-500/30 text-white shadow-lg' 
              : 'text-white/70 hover:bg-white/5'}`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-center transition-all ${statusFilter === 'Resolved' 
              ? 'bg-green-500/30 text-white shadow-lg' 
              : 'text-white/70 hover:bg-white/5'}`}
            onClick={() => setStatusFilter('Resolved')}
          >
            Resolved
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-center transition-all ${statusFilter === 'Ignored' 
              ? 'bg-gray-500/30 text-white shadow-lg' 
              : 'text-white/70 hover:bg-white/5'}`}
            onClick={() => setStatusFilter('Ignored')}
          >
            Ignored
          </button>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-6 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search reports by content, user, or community..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-black/40 transition-all duration-300 shadow-lg"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-white/60 absolute right-4 top-3.5" />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
              >
                <option value="All">All Types</option>
                <option value="Post">Posts</option>
                <option value="User">Users</option>
                <option value="Comment">Comments</option>
              </select>
              <FunnelIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all shadow-lg"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <CalendarIcon className="h-5 w-5 text-white/60 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-md text-white/80 hover:bg-white/10 transition-all shadow-lg"
              onClick={() => {
                setSearch('');
                setTypeFilter('All');
                setStatusFilter('All');
                setSortOrder('newest');
              }}
              title="Reset Filters"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Reports Table View (Desktop) */}
        {viewMode === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl p-6 mb-6 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-white/10">
                    <th className="py-4 px-4 font-semibold text-white/90">Reported By</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Reported Item</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Reason</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Content</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Date</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Status</th>
                    <th className="py-4 px-4 font-semibold text-white/90">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <ReportRow 
                      key={report.id} 
                      report={report} 
                      index={index}
                      onActionClick={handleActionClick}
                    />
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/60">No reports found matching your filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Reports Card View (Mobile or optional) */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => (
              <ReportCard
                key={report.id}
                report={report}
                index={index}
                onActionClick={handleActionClick}
              />
            ))}
            {filteredReports.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full bg-black/30 backdrop-blur-md rounded-xl p-10 border border-white/10 text-center"
              >
                <ExclamationTriangleIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl text-white font-medium mb-2">No reports found</h3>
                <p className="text-white/60">Try adjusting your search or filters to find what you're looking for.</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex justify-between items-center mt-8 text-white/80"
          >
            <div className="text-sm">
              Showing <span className="font-medium">{filteredReports.length}</span> of <span className="font-medium">{mockReports.length}</span> reports
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-black/30 backdrop-blur-md hover:bg-white/10 transition-all">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex space-x-1">
                <button className="w-8 h-8 rounded-lg bg-blue-500/80 text-white flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">2</button>
              </div>
              <button className="p-2 rounded-lg bg-black/30 backdrop-blur-md hover:bg-white/10 transition-all">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      
      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <ReportDetailModal 
            report={selectedReport} 
            onClose={() => setSelectedReport(null)} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}
