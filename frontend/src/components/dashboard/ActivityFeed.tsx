// components/dashboard/RecentActivity.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SectionCard from './SectionCard';
import { Clock, CheckCircle, UserPlus, FolderPlus, Bell, Trash2, Users, Calendar, ArrowRight } from 'lucide-react';
import { Notification, NotificationType } from '@/types/type';
import { fetchNotifications, pollNotifications } from '@/services/notificationService';

interface ActivityItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
}

const RecentActivity: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPollTime, setLastPollTime] = useState<Date>(new Date());

  // Convert notifications to activity items
  const convertToActivityItems = (notifications: Notification[]): ActivityItem[] => {
    if (!notifications || notifications.length === 0) return [];
    return notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      description: notification.message,
      timestamp: new Date(notification.createdAt),
      isRead: notification.isRead
    }));
  };

  // Initial load of notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotifications({limit: 5});
      setNotifications(data.notifications);
      setLastPollTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Smart polling function
  const pollForUpdates = useCallback(async () => {
    try {
      const { notifications: newNotifications } = await pollNotifications();
      console.log('Polled notifications:', newNotifications); 
      // Only update if we have new notifications
      if (newNotifications.length > notifications.length) {
        setNotifications(newNotifications);
        setLastPollTime(new Date());
      }
    } catch (err) {
      console.error('Error polling for notifications:', err);
    }
  }, [notifications.length]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Smart polling setup
  useEffect(() => {
    // Start with 30 second intervals
    let pollInterval = 30000;
    
    const setupPolling = () => {
      const interval = setInterval(() => {
        pollForUpdates();
        
        // Gradually increase polling interval if no new activity
        const timeSinceLastUpdate = Date.now() - lastPollTime.getTime();
        if (timeSinceLastUpdate > 5 * 60 * 1000) { // 5 minutes
          pollInterval = Math.min(pollInterval * 1.5, 5 * 60 * 1000); // Max 5 minutes
        }
      }, pollInterval);

      return interval;
    };

    const interval = setupPolling();

    // Reset polling interval when user becomes active
    const handleUserActivity = () => {
      pollInterval = 30000; // Reset to 30 seconds
      pollForUpdates();
    };

    window.addEventListener('focus', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [pollForUpdates, lastPollTime]);

  const activities = convertToActivityItems(notifications).slice(0, 5); // Show only 5 activities

  const getActivityIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.TASK_UPDATED:
        return <Clock className="w-4 h-4 text-blue-500" />;
      case NotificationType.PROJECT_MEMBER_ADDED:
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case NotificationType.BOARD_CREATED:
        return <FolderPlus className="w-4 h-4 text-orange-500" />;
      case NotificationType.BOARD_UPDATED:
        return <Calendar className="w-4 h-4 text-yellow-500" />;
      case NotificationType.BOARD_DELETED:
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case NotificationType.PROJECT_MEMBER_REMOVED:
        return <Users className="w-4 h-4 text-gray-500" />;
      case NotificationType.TASK_UNASSIGNED:
        return <Bell className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <SectionCard title="Recent Activity" className="min-h-[300px]">
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 text-sm pt-8">
            Loading activity...
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-sm pt-8">
            {error}
          </div>
        ) : activities.length > 0 ? (
          <>
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  activity.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-2 border-blue-400'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      activity.isRead ? 'text-gray-900' : 'text-blue-900'
                    }`}>
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  {!activity.isRead && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Read More Link */}
            <div className="pt-4 border-t border-gray-100">
              <Link 
                href="/notifications" 
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                View all notifications
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
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