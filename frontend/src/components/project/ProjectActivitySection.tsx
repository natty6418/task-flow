"use client";
import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { ActivityLog, ActionType, ActivityLogDiffResponse } from '@/types/type';
import { fetchActivityLogsForProject, fetchLogDiff } from '@/services/activityService';

interface ProjectActivitySectionProps {
  projectId: string;
}

interface ActivityItem {
  id: string;
  action: ActionType;
  message: string;
  timestamp: Date;
  userId: string;
  userName: string;
  taskId?: string;
  boardId?: string;
}

const ProjectActivitySection: React.FC<ProjectActivitySectionProps> = ({ projectId }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [diffData, setDiffData] = useState<{ [key: string]: ActivityLogDiffResponse | null }>({});
  const [loadingDiff, setLoadingDiff] = useState<{ [key: string]: boolean }>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Reduced to 5 to make pagination more visible

  // Load diff data for an activity
  const loadDiffData = useCallback(async (activityId: string) => {
    if (diffData[activityId] || loadingDiff[activityId]) return;

    try {
      setLoadingDiff(prev => ({ ...prev, [activityId]: true }));
      const data = await fetchLogDiff(activityId);
      setDiffData(prev => ({ ...prev, [activityId]: data }));
    } catch (err) {
      console.error('Error loading diff data:', err);
      setDiffData(prev => ({ ...prev, [activityId]: null }));
    } finally {
      setLoadingDiff(prev => ({ ...prev, [activityId]: false }));
    }
  }, [diffData, loadingDiff]);

  // Toggle activity expansion
  const toggleActivity = useCallback((activityId: string) => {
    if (expandedActivity === activityId) {
      setExpandedActivity(null);
    } else {
      setExpandedActivity(activityId);
      // Load diff data when expanding
      loadDiffData(activityId);
    }
  }, [expandedActivity, loadDiffData]);

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
      taskId: log.taskId,
      boardId: log.boardId
    }));
  };

  // Load project activities with pagination
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Load a large batch to populate pagination for demo
      const data = await fetchActivityLogsForProject(projectId, 100); // Load 100 activities
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project activities');
      console.error('Error loading project activities:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Refresh activities for current page
  const refreshActivities = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchActivityLogsForProject(projectId, 100);
      setActivities(data);
    } catch (err) {
      console.error('Error refreshing activities:', err);
    } finally {
      setRefreshing(false);
    }
  }, [projectId]);

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Auto-refresh setup
  useEffect(() => {
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      refreshActivities();
    }, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [refreshActivities]);

  // Filter activities based on search
  const filteredActivities = convertToActivityItems(activities).filter(activity => {
    if (searchTerm) {
      return activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
             activity.userName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Update pagination when filtered activities change
  useEffect(() => {
    // Reset to first page when search changes
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Calculate pagination from filtered activities
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  // Update displayed total
  const displayedTotal = filteredActivities.length;

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpandedActivity(null); // Collapse any expanded activity when changing pages
  };

  const goToPrevious = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

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

  // Render field change - minimalistic version
  const renderFieldChange = (fieldName: string, change: { type: string; oldValue?: unknown; newValue?: unknown }) => {
    const displayName = fieldName.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    
    return (
      <div className="py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {displayName}
          </span>
          
          {change.type === 'added' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">+</span>
              <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                {String(change.newValue || 'N/A')}
              </span>
            </div>
          )}

          {change.type === 'removed' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">-</span>
              <span className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded line-through">
                {String(change.oldValue || 'N/A')}
              </span>
            </div>
          )}

          {change.type === 'modified' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-700 bg-red-50 px-2 py-1 rounded">
                {String(change.oldValue || 'N/A')}
              </span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-green-700 bg-green-50 px-2 py-1 rounded">
                {String(change.newValue || 'N/A')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Activity</h3>
            <p className="text-sm text-gray-600">Track all activities within this project</p>
          </div>
          <button
            onClick={refreshActivities}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search project activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Activity List */}
      <div className="overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading project activities...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              {error}
            </div>
            <button
              onClick={() => loadActivities()}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Try again
            </button>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div>
            <div className="divide-y divide-gray-200">
              {paginatedActivities.map((activity) => {
                const isExpanded = expandedActivity === activity.id;
                const activityDiff = diffData[activity.id];
                const isLoadingActivityDiff = loadingDiff[activity.id];
                
                return (
                  <div key={activity.id} className="transition-all duration-200">
                    <div 
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleActivity(activity.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.userName}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getActionColor(activity.action)}`}>
                                {activity.action.replace('_', ' ').toLowerCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {formatTimeAgo(activity.timestamp)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatFullDate(activity.timestamp)}
                                </p>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {activity.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="pt-3">
                          {/* Diff Section */}
                          {isLoadingActivityDiff ? (
                            <div className="text-center py-6">
                              <div className="inline-flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading changes...</span>
                              </div>
                            </div>
                          ) : activityDiff?.diffDetails ? (
                            <div className="space-y-1">
                              {Object.entries(activityDiff.diffDetails.changes).map(([fieldName, change]) => (
                                <div key={fieldName}>
                                  {renderFieldChange(fieldName, change)}
                                </div>
                              ))}

                              {/* Text Diffs - simplified */}
                              {Object.keys(activityDiff.textDiffs).length > 0 && (
                                <div className="pt-3 border-t border-gray-200 mt-3">
                                  {Object.entries(activityDiff.textDiffs).map(([fieldName, textDiff]) => (
                                    <div key={fieldName} className="py-2">
                                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                        {fieldName.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} changes
                                      </div>
                                      <div className="font-mono text-xs p-2 rounded border bg-white overflow-x-auto">
                                        {textDiff.map((part, index) => (
                                          <span
                                            key={index}
                                            className={
                                              part.added
                                                ? 'bg-green-100 text-green-800'
                                                : part.removed
                                                ? 'bg-red-100 text-red-800 line-through'
                                                : 'text-gray-600'
                                            }
                                          >
                                            {part.value}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : activityDiff === null ? (
                            <div className="text-center py-6">
                              <div className="text-gray-400">
                                <AlertCircle className="w-4 h-4 mx-auto mb-2" />
                                <p className="text-xs">Unable to load changes</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-xs text-gray-400">No changes to display</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, displayedTotal)} of {displayedTotal} activities
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevious}
                      disabled={currentPage === 1}
                      title="Previous page"
                      className="p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={goToNext}
                      disabled={currentPage === totalPages}
                      title="Next page"
                      className="p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No activities match your search criteria.' : 'No activities to display for this project.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectActivitySection;
