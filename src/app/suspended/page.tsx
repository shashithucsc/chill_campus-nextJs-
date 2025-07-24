'use client';

import { motion } from "framer-motion";
import { ExclamationTriangleIcon, HomeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 font-sans flex items-center justify-center p-4">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full"
      >
        {/* Card */}
        <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo" width={60} height={60} className="rounded-xl" />
          </div>

          {/* Warning Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Account Suspended
          </motion.h1>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-8"
          >
            <p className="text-white/80 text-lg leading-relaxed">
              Your account has been temporarily suspended.
            </p>
            <p className="text-white/60 text-sm">
              If you believe this is an error or have questions about your suspension, 
              please contact our support team for assistance.
            </p>
          </motion.div>

          {/* Support Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10"
          >
            <h3 className="text-white font-semibold mb-2">Contact Support</h3>
            <p className="text-white/60 text-sm mb-2">
              Email: support@chillcampus.edu
            </p>
            <p className="text-white/60 text-sm">
              Phone: +1 (555) 123-4567
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Link
              href="/"
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            
            <button
              onClick={() => window.location.href = 'mailto:support@chillcampus.edu?subject=Account Suspension Appeal'}
              className="w-full px-6 py-3 border border-white/20 rounded-xl text-white/80 font-medium hover:bg-white/10 transition-all duration-300"
            >
              Contact Support
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-white/40 text-sm mt-6"
        >
          ChillCampus - University Community Platform
        </motion.p>
      </motion.div>
    </div>
  );
}
