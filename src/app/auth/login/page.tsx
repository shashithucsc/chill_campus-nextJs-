'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserGroupIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: '', type: 'error' });
  const callbackUrl = searchParams.get('callbackUrl') || '/home';
  
  // Flag to track if user has explicitly attempted login
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // No more automatic redirects when the page loads
  // The redirection will only happen after successful login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setHasAttemptedLogin(true); // Mark that user has explicitly attempted login

    try {
      // Handle all logins (including admin) with unified flow
      try {
        // First create the custom session with our own JWT
        const customSessionResponse = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        if (!customSessionResponse.ok) {
          const errorData = await customSessionResponse.json();
          
          // Check if user is suspended
          if (errorData.suspended) {
            router.push('/suspended');
            return;
          }
          
          setPopup({
            open: true,
            message: errorData.message || 'Login failed. Please try again.',
            type: 'error'
          });
          setHasAttemptedLogin(false);
          return;
        }

        const userData = await customSessionResponse.json();

        // Then use NextAuth for client-side session
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setPopup({ 
            open: true, 
            message: 'Invalid email or password. Please try again.', 
            type: 'error' 
          });
          setHasAttemptedLogin(false); // Reset login attempt on error
        } else if (result?.ok) {
          // Check if this is an admin user and redirect accordingly
          if (userData.user?.role === 'admin') {
            setPopup({ 
              open: true, 
              message: 'Admin login successful! Redirecting to dashboard...', 
              type: 'success' 
            });
            
            setTimeout(() => {
              router.push('/Admin/Dashboard');
            }, 1500);
          } else {
            // Show success message for regular users
            setPopup({ 
              open: true, 
              message: 'Login successful! Redirecting to home...', 
              type: 'success' 
            });
            
            // Delay redirect to show success message
            setTimeout(() => {
              router.push('/home');
            }, 1500);
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        setPopup({
          open: true,
          message: 'An error occurred during login. Please try again later.',
          type: 'error'
        });
        setHasAttemptedLogin(false);
      }
    } catch (err) {
      setPopup({
        open: true,
        message: 'An error occurred during login. Please try again later.',
        type: 'error'
      });
    } finally {
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
        {[...Array(6)].map((_, i) => (
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
              delay: Math.random() * 2
            }}
            className="absolute w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-16 text-blue-300/40"
        >
          <UserGroupIcon className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-20 text-purple-300/40"
        >
          <AcademicCapIcon className="w-14 h-14" />
        </motion.div>
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 right-16 text-indigo-300/40"
        >
          <SparklesIcon className="w-12 h-12" />
        </motion.div>
      </div>

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
            Welcome Back
          </h2>
          <p className="text-white/80 text-lg">
            Sign in to continue your journey
          </p>
          <p className="mt-4 text-white/60">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all duration-300">
              Create one here
            </Link>
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-md py-10 px-8 shadow-2xl border border-white/20 rounded-3xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    autoComplete="current-password"
                    required
                    className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10 backdrop-blur-sm"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all duration-300">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Admin Credentials Hint */}
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
                <p className="text-xs text-blue-300/90 text-center">
                  <span className="font-semibold">Admin Access:</span> admin@gmail.com / admin123
                </p>
              </div>

              {/* Submit Button */}
              <div>
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
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Status Popup (Error or Success) */}
      <AnimatePresence>
        {popup.open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center border ${
                popup.type === 'success' ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                popup.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-xl ${popup.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {popup.type === 'success' ? '✅' : '❌'}
                </span>
              </div>
              <p className="text-gray-800 mb-6 font-medium">{popup.message}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 text-white rounded-xl font-semibold transition-all duration-300 ${
                  popup.type === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
                onClick={() => setPopup({ open: false, message: '', type: popup.type })}
              >
                {popup.type === 'success' ? 'Please wait...' : 'Try Again'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}