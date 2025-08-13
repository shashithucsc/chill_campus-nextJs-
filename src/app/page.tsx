'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ParticlesBackground from './components/ParticlesBackground';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  PlayIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  // Animation variants for staggered animations
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Animation for floating icons
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10]
    }
  };
  
  const floatingTransition = {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
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
        {/* Gradient Overlay - Updated with new color theme */}
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', opacity: 0.8}}></div>
      </div>

      {/* Floating Particles */}
      <ParticlesBackground />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed z-50 w-full bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="Chill Campus Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Chill Campus
              </h1>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'Communities', 'About'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  whileHover={{ scale: 1.1, color: '#60A5FA' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/90 hover:text-blue-300 transition-colors font-medium"
                >
                  {item}
                </motion.a>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/login"
                  className="px-6 py-2 text-white/90 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-40 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.5,
              staggerChildren: 0.2
            }}
            className="text-center space-y-8"
          >
            {/* Floating Icons */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-20 left-10 text-blue-300/60"
              >
                <UserGroupIcon className="w-12 h-12" />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-32 right-16 text-purple-300/60"
                style={{ animationDelay: '1s' }}
              >
                <AcademicCapIcon className="w-10 h-10" />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute bottom-40 left-20 text-indigo-300/60"
                style={{ animationDelay: '2s' }}
              >
                <ChatBubbleLeftRightIcon className="w-8 h-8" />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute bottom-32 right-12 text-cyan-300/60"
                style={{ animationDelay: '0.5s' }}
              >
                <GlobeAltIcon className="w-12 h-12" />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-40 right-32 text-pink-300/60"
                style={{ animationDelay: '1.5s' }}
              >
                <SparklesIcon className="w-8 h-8" />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute bottom-20 left-1/3 text-yellow-300/60"
                style={{ animationDelay: '2.5s' }}
              >
                <HeartIcon className="w-10 h-10" />
              </motion.div>
            </div>

            {/* Main Headline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6">
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Connect, Learn,
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Thrive Together
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
              >
                Join the ultimate university social platform where students connect, 
                collaborate, and build lifelong friendships across campuses worldwide.
              </motion.p>
            </motion.div>

            {/* Mission Line */}
            <motion.div 
              variants={itemVariants}
              className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <p className="text-white/80 font-medium">
                🌟 Where University Life Comes Alive
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
            >
              {/* Join Now Button */}
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <span>Join Now</span>
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>

              {/* Explore Communities Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
                  <PlayIcon className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Explore Communities</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              variants={itemVariants}
              className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {[
                { number: '50K+', label: 'Active Students' },
                { number: '200+', label: 'Universities' },
                { number: '1M+', label: 'Connections' },
                { number: '10K+', label: 'Communities' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-white/70 text-sm md:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
