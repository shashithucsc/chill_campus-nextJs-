'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ChillCampus</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Connect, Collaborate, and
                  <span className="text-blue-600"> Thrive</span> in Your
                  University Journey
                </h1>
                <p className="text-lg text-gray-600">
                  Join the ultimate social platform for university students. Connect with peers,
                  join communities, attend events, and make your university experience
                  unforgettable.
                </p>
                <div className="flex space-x-4">
                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative h-[400px] md:h-[500px]">
                <div className="absolute inset-0 bg-blue-100 rounded-2xl transform rotate-3"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
                  <div className="p-8 text-white">
                    <h3 className="text-2xl font-bold mb-4">Key Features</h3>
                    <ul className="space-y-4">
                      <li className="flex items-center space-x-2">
                        <span className="text-xl">👥</span>
                        <span>Connect with University Peers</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-xl">🎓</span>
                        <span>Join Academic Communities</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-xl">📅</span>
                        <span>Discover Campus Events</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-xl">💬</span>
                        <span>Real-time Chat & Collaboration</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>© 2024 ChillCampus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
