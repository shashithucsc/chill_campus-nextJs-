'use client';

import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Post from '../components/Post';

// Sample data - In a real app, this would come from an API
const samplePosts = [
  {
    id: '1',
    author: {
      name: 'John Doe',
      avatar: '/default-avatar.png',
      role: 'Computer Science Student',
    },
    content: 'Just finished my final project for the semester! 🎉 Here\'s a screenshot of what I built...',
    image: '/sample-project.png',
    likes: 42,
    comments: 12,
    timestamp: '2 hours ago',
    community: {
      name: 'Computer Science',
      avatar: '/cs-logo.png',
    },
  },
  {
    id: '2',
    author: {
      name: 'Jane Smith',
      avatar: '/default-avatar.png',
      role: 'Engineering Student',
    },
    content: 'Looking for study partners for the upcoming exams. Anyone interested in forming a study group?',
    likes: 15,
    comments: 8,
    timestamp: '4 hours ago',
    community: {
      name: 'Engineering',
      avatar: '/eng-logo.png',
    },
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      
      {/* Main Content */}
      <main className="pt-16 pl-64">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Create Post Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src="/default-avatar.png"
                  alt="Your avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <button className="flex-1 text-left px-4 py-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100">
                What's on your mind?
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Photo</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Video</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Event</span>
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {samplePosts.map((post) => (
              <Post key={post.id} {...post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 