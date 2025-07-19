// components/dashboard/RecentActivity.tsx
import React from 'react';
import SectionCard from './SectionCard';
import { Clock, CheckCircle, UserPlus, FolderPlus } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'task_created' | 'member_added' | 'project_created';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

const RecentActivity: React.FC = () => {
  // Mock data - replace with actual API call
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      title: 'Task Completed',
      description: 'Setup database schema',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'project_created',
      title: 'Project Created',
      description: 'New project "TaskFlow" created',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      user: 'Jane Smith'
    },
    {
      id: '3',
      type: 'member_added',
      title: 'Member Added',
      description: 'New member joined the team',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      user: 'Admin'
    },
    {
      id: '4',
      type: 'task_created',
      title: 'Task Created',
      description: 'Design landing page',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      user: 'Alice Johnson'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'task_created':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'member_added':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'project_created':
        return <FolderPlus className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <SectionCard title="Recent Activity" className="min-h-[300px]">
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm pt-8">
            No recent activity
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default RecentActivity;