// components/dashboard/ActivityFeed.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SectionCard from './SectionCard';
import { 
  Clock, 
  CheckCircle, 
  UserPlus, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Users, 
  Calendar, 
  ArrowRight,
  FileText,
  User,
  AlertCircle
} from 'lucide-react';
import { ActivityLog, ActionType } from '@/types/type';
import { fetchRecentActivity } from '@/services/activityService';

interface ActivityItem {
  id: string;
  action: ActionType;
  message: string;
  timestamp: Date;
  userId: string;
  userName: string;
  projectId?: string;
  taskId?: string;
  boardId?: string;
}

const RecentActivity: React.FC<{ numActivities: number }> = ({ numActivities }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Convert activity logs to activity items
  const convertToActivityItems = (activityLogs: ActivityLog[]): ActivityItem[] => {
    if (!activityLogs || activityLogs.length === 0) return [];
    return activityLogs.map(log => ({
      id: log.id,
      action: log.action,
      message: log.message,
      timestamp: new Date(log.createdAt),
      userId: log.userId,
      userName: log.user?.name || 'Unknown User',
      projectId: log.projectId,
      taskId: log.taskId,
      boardId: log.boardId
    }));
  };

  // Load recent activity
  const loadActivity = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await fetchRecentActivity(numActivities);
      setActivities(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
      console.error('Error loading activity:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  // Auto-refresh setup
  useEffect(() => {
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      loadActivity(false); // Don't show loading spinner for background refresh
    }, 2 * 60 * 1000);

    // Refresh when user becomes active
    const handleUserActivity = () => {
      loadActivity(false); // Don't show loading spinner for user activity refresh
    };

    window.addEventListener('focus', handleUserActivity);
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        loadActivity(false);
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleUserActivity);
      window.removeEventListener('visibilitychange', handleUserActivity);
    };
  }, [loadActivity]);

  const activityItems = convertToActivityItems(activities).slice(0, 6); // Show only 6 activities

  const getActivityIcon = (action: ActionType) => {
    switch (action) {
      case ActionType.TASK_CREATED:
        return <FileText className="w-4 h-4 text-green-500" />;
      case ActionType.TASK_UPDATED:
        return <Edit3 className="w-4 h-4 text-orange-500" />;
      case ActionType.TASK_DELETED:
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case ActionType.TASK_COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case ActionType.TASK_ASSIGNED:
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case ActionType.TASK_UNASSIGNED:
        return <Users className="w-4 h-4 text-gray-500" />;
      case ActionType.BOARD_CREATED:
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case ActionType.BOARD_UPDATED:
        return <Edit3 className="w-4 h-4 text-orange-500" />;
      case ActionType.BOARD_DELETED:
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case ActionType.PROJECT_CREATED:
        return <FolderPlus className="w-4 h-4 text-blue-500" />;
      case ActionType.PROJECT_UPDATED:
        return <Edit3 className="w-4 h-4 text-orange-500" />;
      case ActionType.PROJECT_MEMBER_ADDED:
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case ActionType.PROJECT_MEMBER_REMOVED:
        return <Users className="w-4 h-4 text-gray-500" />;
      case ActionType.COMMENT_ADDED:
        return <FileText className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case ActionType.TASK_CREATED:
      case ActionType.BOARD_CREATED:
      case ActionType.PROJECT_CREATED:
      case ActionType.PROJECT_MEMBER_ADDED:
        return 'bg-green-100 text-green-800';
      case ActionType.TASK_UPDATED:
      case ActionType.BOARD_UPDATED:
      case ActionType.PROJECT_UPDATED:
        return 'bg-orange-100 text-orange-800';
      case ActionType.TASK_DELETED:
      case ActionType.BOARD_DELETED:
      case ActionType.PROJECT_MEMBER_REMOVED:
        return 'bg-red-100 text-red-800';
      case ActionType.TASK_COMPLETED:
        return 'bg-green-100 text-green-800';
      case ActionType.TASK_ASSIGNED:
        return 'bg-indigo-100 text-indigo-800';
      case ActionType.TASK_UNASSIGNED:
        return 'bg-gray-100 text-gray-800';
      case ActionType.COMMENT_ADDED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 text-sm pt-8">
            Loading activity...
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-sm pt-8">
            {error}
          </div>
        ) : activityItems.length > 0 ? (
          <>
            {activityItems.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-blue-200"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.userName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                      {activity.action.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View More Link */}
            <div className="pt-4 border-t border-gray-100">
              <Link 
                href="/activity" 
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                View all activity
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