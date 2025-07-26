"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  UserPlus, 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Users, 
  Calendar,
  FileText,
  AlertCircle,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { ActivityLog, ActionType } from '@/types/type';
import { fetchRecentActivity, fetchUserActivity } from '@/services/activityService';
import ActivityDetailsModal from '@/components/common/ActivityDetailsModal';

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

const ActivityPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'my-activity'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Load activities based on filter
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: ActivityLog[];
      if (filter === 'my-activity' && user?.id) {
        data = await fetchUserActivity(user.id);
      } else {
        data = await fetchRecentActivity(50); // Get more activities for the full page
      }
      
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, user?.id]);

  // Refresh activities
  const refreshActivities = useCallback(async () => {
    try {
      setRefreshing(true);
      
      let data: ActivityLog[];
      if (filter === 'my-activity' && user?.id) {
        data = await fetchUserActivity(user.id);
      } else {
        data = await fetchRecentActivity(50);
      }
      
      setActivities(data);
    } catch (err) {
      console.error('Error refreshing activities:', err);
    } finally {
      setRefreshing(false);
    }
  }, [filter, user?.id]);

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Filter and search activities
  const filteredActivities = convertToActivityItems(activities).filter(activity => {
    if (searchTerm) {
      return activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
             activity.userName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const getActivityIcon = (action: ActionType) => {
    switch (action) {
      case ActionType.TASK_CREATED:
        return <FileText className="w-5 h-5 text-green-500" />;
      case ActionType.TASK_UPDATED:
        return <Edit3 className="w-5 h-5 text-orange-500" />;
      case ActionType.TASK_DELETED:
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case ActionType.TASK_COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case ActionType.TASK_ASSIGNED:
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      case ActionType.TASK_UNASSIGNED:
        return <Users className="w-5 h-5 text-gray-500" />;
      case ActionType.BOARD_CREATED:
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case ActionType.BOARD_UPDATED:
        return <Edit3 className="w-5 h-5 text-orange-500" />;
      case ActionType.BOARD_DELETED:
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case ActionType.PROJECT_CREATED:
        return <FolderPlus className="w-5 h-5 text-blue-500" />;
      case ActionType.PROJECT_UPDATED:
        return <Edit3 className="w-5 h-5 text-orange-500" />;
      case ActionType.PROJECT_MEMBER_ADDED:
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case ActionType.PROJECT_MEMBER_REMOVED:
        return <Users className="w-5 h-5 text-gray-500" />;
      case ActionType.COMMENT_ADDED:
        return <FileText className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case ActionType.TASK_CREATED:
      case ActionType.BOARD_CREATED:
      case ActionType.PROJECT_CREATED:
      case ActionType.PROJECT_MEMBER_ADDED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ActionType.TASK_UPDATED:
      case ActionType.BOARD_UPDATED:
      case ActionType.PROJECT_UPDATED:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ActionType.TASK_DELETED:
      case ActionType.BOARD_DELETED:
      case ActionType.PROJECT_MEMBER_REMOVED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ActionType.TASK_COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ActionType.TASK_ASSIGNED:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case ActionType.TASK_UNASSIGNED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case ActionType.COMMENT_ADDED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActivityClick = (activity: ActivityLog) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-gray-600 mt-2">Track all activities across your projects and tasks</p>
            </div>
            <button
              onClick={refreshActivities}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Activity
                </button>
                <button
                  onClick={() => setFilter('my-activity')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filter === 'my-activity'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Activity
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Loading activities...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                {error}
              </div>
              <button
                onClick={loadActivities}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Try again
              </button>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => {
                // Find the original activity log to pass to modal
                const originalActivity = activities.find(a => a.id === activity.id);
                return (
                  <div 
                    key={activity.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => originalActivity && handleActivityClick(originalActivity)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.userName}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(activity.action)}`}>
                              {activity.action.replace('_', ' ').toLowerCase()}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatFullDate(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {activity.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No activities match your search criteria.' : 'No activities to display yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default ActivityPage;
