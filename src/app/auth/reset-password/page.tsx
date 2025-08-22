'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get and clean the token: decode URL components and trim whitespace
  const rawToken = searchParams?.get('token');
  const token = rawToken ? decodeURIComponent(rawToken).trim() : null;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: '', type: 'error' });
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Animation states for consistent positioning
  const [floatingElements] = useState<Array<{left: number, top: number, delay: number}>>([
    { left: 15, top: 25, delay: 0 },
    { left: 80, top: 15, delay: 0.5 },
    { left: 25, top: 70, delay: 1 },
    { left: 70, top: 60, delay: 1.5 },
    { left: 50, top: 35, delay: 2 },
    { left: 33, top: 45, delay: 0.7 },
  ]);
  
  // Verify token on load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        console.log('No token found in URL');
        setIsValidToken(false);
        setIsTokenChecked(true);
        return;
      }
      
      console.log('Verifying token from URL:', token);
      
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();
        
        console.log('Token verification response:', response.status, data);
        
        if (response.ok) {
          console.log('Token validated successfully');
          setIsValidToken(true);
        } else {
          console.log('Token validation failed:', data.message);
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsValidToken(false);
      } finally {
        setIsTokenChecked(true);
      }
    };
    
    verifyToken();
  }, [token]);
  
  // Password validation
  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsResetSuccessful(true);
        setPopup({
          open: true,
          message: 'Password reset successful! You can now login with your new password.',
          type: 'success'
        });
      } else {
        setPopup({
          open: true,
          message: data.message || 'Failed to reset password. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setPopup({
        open: true,
        message: 'An error occurred. Please try again later.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper for redirect to login
  const redirectToLogin = () => {
    router.push('/auth/login');
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
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', opacity: 0.9}}></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {floatingElements.map((element, i) => (
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
            className="absolute w-24 h-24 rounded-full blur-2xl opacity-20"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
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
        {/* Logo and Back to Login */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-8 left-8"
        >
          <Link href="/auth/login" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <ArrowLeftIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white group-hover:text-blue-200 transition-all duration-300">
              Back to Login
            </span>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        >
          <Link href="/" className="inline-block">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="Chill Campus Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3">
            Reset Your Password
          </h2>
          <p className="text-white/80 text-base">
            Create a new password for your account
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
            {!isTokenChecked ? (
              // Loading state while checking token
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/80">Verifying your reset link...</p>
              </div>
            ) : !isValidToken ? (
              // Invalid token state
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Invalid or Expired Link</h3>
                <p className="text-white/70 mb-6">
                  This password reset link is invalid or has expired.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/auth/forgot-password')}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Request New Link
                </motion.button>
              </div>
            ) : isResetSuccessful ? (
              // Success state
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-green-400">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Password Reset Complete</h3>
                <p className="text-white/70 mb-6">
                  Your password has been successfully reset.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={redirectToLogin}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Go to Login
                </motion.button>
              </div>
            ) : (
              // Reset password form
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                    New Password
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
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <p className="mt-1 text-xs text-white/60">
                    Password must be at least 8 characters long
                  </p>
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
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                {/* Password Error */}
                {passwordError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-sm">{passwordError}</p>
                  </div>
                )}

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
                        : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                    style={!isLoading ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* Status Popup */}
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
                onClick={() => {
                  setPopup({ open: false, message: '', type: popup.type });
                  if (popup.type === 'success') {
                    redirectToLogin();
                  }
                }}
              >
                {popup.type === 'success' ? 'Go to Login' : 'Try Again'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
