import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

// Temporary mock data
const trendingTopics = [
  { id: 1, name: '#Hackathon2024', posts: 156 },
  { id: 2, name: '#InterUniDebate', posts: 89 },
  { id: 3, name: '#TechMeetup', posts: 67 },
  { id: 4, name: '#CampusLife', posts: 45 },
  { id: 5, name: '#StudentProjects', posts: 34 },
];

const TrendingTopics = () => {
  return (
    <div className="p-4">
      <div className="space-y-4">
        {trendingTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.name.slice(1)}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">{topic.name}</span>
            </div>
            <span className="text-sm text-gray-500">{topic.posts} posts</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics; 