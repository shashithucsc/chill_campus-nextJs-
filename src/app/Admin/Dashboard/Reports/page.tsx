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
  ShieldExclamationIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

interface ReportsResponse {
  success: boolean;
  reports: Report[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReports: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    pending: number;
    resolved: number;
    ignored: number;
  };
  error?: string;
}

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

        {report.type !== 'User' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onActionClick('suspend', report)}
            className="flex items-center justify-center px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg transition-all text-sm"
          >
            <ShieldExclamationIcon className="h-4 w-4 mr-1.5" /> Suspend User
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onActionClick('warn', report)}
          className="flex items-center justify-center px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 rounded-lg transition-all text-sm"
        >
          <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" /> Warn User
        </motion.button>
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
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ pending: 0, resolved: 0, ignored: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Count reports by status
  const pendingCount = stats.pending;
  const resolvedCount = stats.resolved;
  const ignoredCount = stats.ignored;

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '50',
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(typeFilter !== 'All' && { type: typeFilter }),
        ...(search && { search })
      });

      console.log('Fetching reports with params:', params.toString());

      const response = await fetch(`/api/reports?${params}`);
      const data: ReportsResponse = await response.json();

      console.log('Reports API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reports');
      }

      if (data.success) {
        setReports(data.reports);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchReports();
    }
  }, [session, statusFilter, typeFilter, search, pagination.currentPage]);
  
  // Filter reports (local filtering on already fetched data)
  useEffect(() => {
    let results = [...reports];
    
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
  }, [reports, sortOrder]);
  
  // Handle report actions
  const handleActionClick = async (action: string, report: Report) => {
    if (action === 'view') {
      setSelectedReport(report);
      return;
    }

    try {
      console.log(`Performing ${action} on report ${report.id}`);
      
      let apiAction = action;
      let adminNotes = '';

      // Map UI actions to API actions
      switch (action) {
        case 'resolve':
          apiAction = 'resolve';
          adminNotes = 'Report resolved by admin';
          break;
        case 'ignore':
          apiAction = 'ignore';
          adminNotes = 'Report ignored by admin';
          break;
        case 'delete':
          apiAction = 'delete_content';
          adminNotes = 'Content deleted due to policy violation';
          break;
        case 'block':
          apiAction = 'block_user';
          adminNotes = 'User blocked due to policy violation';
          break;
        case 'suspend':
          apiAction = 'suspend_user';
          adminNotes = 'User suspended due to policy violation';
          break;
        case 'warn':
          apiAction = 'warn_user';
          adminNotes = 'User warned about policy violation';
          break;
        default:
          throw new Error('Invalid action');
      }

      const response = await fetch(`/api/reports/${report.id}/actions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: apiAction,
          adminNotes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} report`);
      }

      if (data.success) {
        console.log(`${action} successful:`, data);
        
        // Update local state
        setReports(prevReports => 
          prevReports.map(r => 
            r.id === report.id 
              ? { ...r, status: data.report.status, adminNotes: data.report.adminNotes }
              : r
          )
        );

        // Show success message (you can implement a toast notification here)
        alert(`Report ${action} successful: ${data.message}`);

        // Refresh data from server
        await fetchReports();
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Failed to ${action} report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <main className="pt-8 px-4 sm:px-8 pb-8 transition-all">
      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Loading reports...</p>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-6 shadow-xl"
        >
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-8 w-8 text-red-400 mr-3" />
            <div>
              <h3 className="text-red-300 font-bold text-lg">Error Loading Reports</h3>
              <p className="text-red-200 mt-1">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
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
              Showing <span className="font-medium">{filteredReports.length}</span> of <span className="font-medium">{pagination.totalReports}</span> reports
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
