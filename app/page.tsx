import { Suspense } from 'react';
import Feed from '@/components/feed/Feed';
import TrendingTopics from '@/components/feed/TrendingTopics';
import UpcomingEvents from '@/components/feed/UpcomingEvents';
import CreatePost from '@/components/feed/CreatePost';
import Link from "next/link";
import Layout from "@/components/layout/Layout";

export default function Home() {
  return (
    <>
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow">
              <CreatePost />
              <Suspense fallback={<div>Loading feed...</div>}>
                <Feed />
              </Suspense>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">Trending Topics</h2>
              </div>
              <Suspense fallback={<div>Loading trending topics...</div>}>
                <TrendingTopics />
              </Suspense>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              </div>
              <Suspense fallback={<div>Loading events...</div>}>
                <UpcomingEvents />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 