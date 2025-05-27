import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: 'Tech Workshop 2024',
    description: 'Learn about the latest technologies and network with industry professionals.',
    date: '2024-03-15',
    time: '10:00 AM',
    location: 'University of Moratuwa',
    type: 'Workshop',
    attendees: 45,
  },
  {
    id: 2,
    title: 'Hackathon 2024',
    description: '24-hour coding competition for university students.',
    date: '2024-04-01',
    time: '9:00 AM',
    location: 'University of Peradeniya',
    type: 'Competition',
    attendees: 120,
  },
  // Add more mock events as needed
];

export default function Events() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredEvents = mockEvents.filter(event => {
    const matchesDate = !selectedDate || event.date === selectedDate;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesDate && matchesType;
  });

  return (
    <Layout>
      <Head>
        <title>Events - ChillCampus</title>
        <meta name="description" content="Discover and participate in university events" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Events
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/events/create"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Event
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Competition">Competition</option>
              <option value="Seminar">Seminar</option>
              <option value="Conference">Conference</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="mt-8 space-y-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {event.type}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="mt-1 text-sm text-gray-900">{event.date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="mt-1 text-sm text-gray-900">{event.time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="mt-1 text-sm text-gray-900">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Attendees</p>
                    <p className="mt-1 text-sm text-gray-900">{event.attendees}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 