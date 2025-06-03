import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';

// Temporary mock data
const upcomingEvents = [
  {
    id: 1,
    title: 'Inter-University Tech Symposium',
    date: 'Mar 15, 2024',
    time: '9:00 AM',
    location: 'University of Moratuwa',
    participants: 128,
    type: 'Tech',
  },
  {
    id: 2,
    title: 'Debate Championship Finals',
    date: 'Mar 20, 2024',
    time: '2:00 PM',
    location: 'University of Colombo',
    participants: 64,
    type: 'Debate',
  },
  {
    id: 3,
    title: 'Music Festival',
    date: 'Mar 25, 2024',
    time: '6:00 PM',
    location: 'University of Peradeniya',
    participants: 256,
    type: 'Music',
  },
];

const UpcomingEvents = () => {
  return (
    <div className="p-4">
      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.participants} participants</span>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {event.type}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href="/events"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View all events →
        </Link>
      </div>
    </div>
  );
};

export default UpcomingEvents; 