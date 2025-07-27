'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";


const metricConfig = [
  { name: "Total Users", key: "totalUsers", icon: UserIcon, color: "from-blue-500 to-purple-500" },
  { name: "Total Communities", key: "totalCommunities", icon: RectangleGroupIcon, color: "from-green-400 to-blue-400" },
  { name: "Total Posts", key: "totalPosts", icon: DocumentTextIcon, color: "from-pink-500 to-red-400" },
  { name: "Reported Posts", key: "reportedPosts", icon: ExclamationTriangleIcon, color: "from-yellow-400 to-red-500" },
  { name: "New Signups (Week)", key: "newSignupsWeek", icon: UsersIcon, color: "from-indigo-400 to-blue-500" },
  { name: "Total Comments", key: "totalComments", icon: ChatBubbleLeftRightIcon, color: "from-cyan-400 to-blue-400" },
];

const recentActions = [
  { type: "User Registration", user: "Alice", time: "2m ago" },
  { type: "Community Created", user: "Bob", time: "10m ago" },
  { type: "Report Filed", user: "Charlie", time: "20m ago" },
  { type: "Post Deleted", user: "Admin", time: "30m ago" },
  { type: "User Registration", user: "David", time: "1h ago" },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCommunities: 0,
    totalPosts: 0,
    reportedPosts: 0,
    newSignupsWeek: 0,
    totalComments: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    setLoadingMetrics(true);
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoadingMetrics(false);
      })
      .catch(() => setLoadingMetrics(false));
  }, []);

  return (
    <main className="pt-8 px-4 sm:px-8 pb-8 transition-all">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {metricConfig.map((metric, i) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl shadow-xl p-6 bg-black/30 backdrop-blur-xl border border-white/10 flex items-center space-x-5 hover:shadow-2xl transition-all cursor-pointer`}
          >
            <div className={`h-14 w-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${metric.color} text-white shadow-lg`}>
              <metric.icon className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {loadingMetrics ? (
                  <span className="animate-pulse text-white/40">...</span>
                ) : (
                  (metrics as any)[metric.key]
                )}
              </div>
              <div className="text-white/70 text-lg font-medium">{metric.name}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-2 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/80 text-lg font-semibold flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" /> Engagement (Mock Chart)
            </div>
            <button className="flex items-center px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 text-sm">
              <MagnifyingGlassIcon className="h-5 w-5 mr-1" /> Filter
            </button>
          </div>
          {/* Mock Bar Chart */}
          <div className="flex items-end space-x-3 h-40 mt-6">
            {[60, 80, 40, 100, 70, 90, 50].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="w-8 rounded-xl bg-gradient-to-t from-blue-500/70 to-purple-400/80 shadow-lg"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="flex justify-between text-white/60 text-xs mt-4">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl p-6 flex flex-col"
        >
          <div className="text-white/80 text-lg font-semibold mb-4 flex items-center">
            <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-cyan-400" /> Recent Activity
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-4">
              {recentActions.map((action, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400/30 to-purple-400/30 flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{action.type}</div>
                    <div className="text-white/60 text-sm">{action.user} • {action.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Recent Actions Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/80 text-lg font-semibold flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-300" /> Recent Actions
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users, communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-white/60 absolute right-3 top-2.5" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-white/90 text-left rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActions
                .filter(a => a.user.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()))
                .map((action, i) => (
                <tr key={i} className="hover:bg-white/10 transition-all">
                  <td className="py-3 px-4">{action.type}</td>
                  <td className="py-3 px-4">{action.user}</td>
                  <td className="py-3 px-4">{action.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </main>
  );
}