"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

function MessageBox({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border ${
            type === "success"
              ? "border-green-200"
              : "border-red-200"
          }`}
        >
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
            type === "success" ? "bg-green-100" : "bg-red-100"
          }`}>
            <span className={`text-xl ${type === "success" ? "text-green-600" : "text-red-600"}`}>
              {type === "success" ? "✅" : "❌"}
            </span>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">
            {type === "success" ? "Success!" : "Error!"}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
              type === "success" 
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            }`}
          >
            {type === "success" ? "Continue" : "Try Again"}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation states for consistent positioning
  const [floatingElements, setFloatingElements] = useState<Array<{left: number, top: number, delay: number}>>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize animation positions on client-side only
  useEffect(() => {
    setIsClient(true);
    
    // Generate floating elements positions
    const floatingElementsData = Array.from({ length: 6 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2
    }));
    
    setFloatingElements(floatingElementsData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType("error");
        setMessage(data.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      setMessageType("success");
      setMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        setMessage(null);
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-indigo-900/90"></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {isClient && floatingElements.map((element, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1] as any,
              delay: element.delay
            }}
            className="absolute w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
            }}
          />
        ))}
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-12 text-blue-300/40"
        >
          <UserGroupIcon className="w-20 h-20" />
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-16 text-purple-300/40"
        >
          <AcademicCapIcon className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 right-12 text-indigo-300/40"
        >
          <SparklesIcon className="w-14 h-14" />
        </motion.div>
        <motion.div
          animate={{ y: [8, -8, 8], rotate: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-1/3 left-16 text-cyan-300/40"
        >
          <BuildingLibraryIcon className="w-18 h-18" />
        </motion.div>
      </div>

      {/* Message Box */}
      {message && (
        <MessageBox message={message} type={messageType} onClose={() => setMessage(null)} />
      )}

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Logo and Back to Home */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-8 left-8"
        >
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Chill Campus Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
              Chill Campus
            </span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3">
            Join Chill Campus
          </h2>
          <p className="text-white/80 text-lg">
            Start your university social journey
          </p>
          <p className="mt-4 text-white/60">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all duration-300"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg"
        >
          <div className="bg-white/10 backdrop-blur-md py-10 px-8 shadow-2xl border border-white/20 rounded-3xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-white/90 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* University Field */}
              <div>
                <label htmlFor="university" className="block text-sm font-semibold text-white/90 mb-2">
                  University
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <BuildingLibraryIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <select
                    id="university"
                    name="university"
                    required
                    className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 backdrop-blur-sm transition-all duration-300 appearance-none cursor-pointer"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  >
                    <option value="" className="bg-gray-800 text-white">-- Select University --</option>
                    <option value="UCSC" className="bg-gray-800 text-white">University of Colombo School of Computing (UCSC)</option>
                    <option value="UoM" className="bg-gray-800 text-white">University of Moratuwa</option>
                    <option value="UoP" className="bg-gray-800 text-white">University of Peradeniya</option>
                    <option value="UoK" className="bg-gray-800 text-white">University of Kelaniya</option>
                    <option value="UoJ" className="bg-gray-800 text-white">University of Jaffna</option>
                    <option value="UoR" className="bg-gray-800 text-white">University of Ruhuna</option>
                    <option value="UoSJP" className="bg-gray-800 text-white">University of Sri Jayewardenepura</option>
                    <option value="NSBM" className="bg-gray-800 text-white">NSBM Green University</option>
                    <option value="SLIIT" className="bg-gray-800 text-white">Sri Lanka Institute of Information Technology (SLIIT)</option>
                    <option value="APIIT" className="bg-gray-800 text-white">APIIT Sri Lanka</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 backdrop-blur-sm transition-all duration-300"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 backdrop-blur-sm transition-all duration-300"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white transition-all duration-300 ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
