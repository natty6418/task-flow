"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
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
  ChevronDown,
  ChevronRight,
  Diff
} from 'lucide-react';
import { ActivityLog, ActionType, ActivityLogDiffResponse, TextDiffPart } from '@/types/type';
import { fetchLogDiff } from '@/services/activityService';

interface ActivityDetailsModalProps {
  activity: ActivityLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  activity,
  isOpen,
  onClose
}) => {
  const [diffData, setDiffData] = useState<ActivityLogDiffResponse | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [showDiffDetails, setShowDiffDetails] = useState(false);

  const loadDiffData = useCallback(async () => {
    if (!activity) return;

    try {
      setLoadingDiff(true);
      setDiffError(null);
      const data = await fetchLogDiff(activity.id);
      console.log('Fetched diff data:', data); // Debug log
      setDiffData(data);
    } catch (err) {
      setDiffError(err instanceof Error ? err.message : 'Failed to load diff data');
      console.error('Error loading diff data:', err);
    } finally {
      setLoadingDiff(false);
    }
  }, [activity]);

  // Load diff data when activity changes
  useEffect(() => {
    if (activity && isOpen) {
      loadDiffData();
    }
  }, [activity, isOpen, loadDiffData]);

  const getActivityIcon = (action: ActionType) => {
    switch (action) {
      case ActionType.TASK_CREATED:
        return <FileText className="w-6 h-6 text-green-500" />;
      case ActionType.TASK_UPDATED:
        return <Edit3 className="w-6 h-6 text-orange-500" />;
      case ActionType.TASK_DELETED:
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case ActionType.TASK_COMPLETED:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case ActionType.TASK_ASSIGNED:
        return <UserPlus className="w-6 h-6 text-indigo-500" />;
      case ActionType.TASK_UNASSIGNED:
        return <Users className="w-6 h-6 text-gray-500" />;
      case ActionType.BOARD_CREATED:
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case ActionType.BOARD_UPDATED:
        return <Edit3 className="w-6 h-6 text-orange-500" />;
      case ActionType.BOARD_DELETED:
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case ActionType.PROJECT_CREATED:
        return <FolderPlus className="w-6 h-6 text-blue-500" />;
      case ActionType.PROJECT_UPDATED:
        return <Edit3 className="w-6 h-6 text-orange-500" />;
      case ActionType.PROJECT_MEMBER_ADDED:
        return <UserPlus className="w-6 h-6 text-purple-500" />;
      case ActionType.PROJECT_MEMBER_REMOVED:
        return <Users className="w-6 h-6 text-gray-500" />;
      case ActionType.COMMENT_ADDED:
        return <FileText className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderTextDiff = (textDiffs: TextDiffPart[]) => {
    return (
      <div className="font-mono text-sm p-3 rounded border overflow-x-auto">
        {textDiffs.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? 'bg-green-200 text-green-800'
                : part.removed
                ? 'bg-red-200 text-red-800 line-through'
                : 'text-gray-700'
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

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


  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {activity && getActivityIcon(activity.action)}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activity Details</h2>
              <p className="text-sm text-gray-600">
                {activity && formatDate(activity.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close modal"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activity && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Activity Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">User:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {activity.user?.name || 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Action:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {activity.action.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Message:</span>
                    <p className="text-sm text-gray-900 mt-1">{activity.message}</p>
                  </div>
                  {activity.projectId && activity.project && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Project:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.project.name}
                      </span>
                    </div>
                  )}
                  {activity.taskId && activity.task && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Task:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.task.title}
                      </span>
                    </div>
                  )}
                  {activity.boardId && activity.board && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Board:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.board.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Differences Section */}
              {loadingDiff ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4 animate-spin" />
                    Loading differences...
                  </div>
                </div>
              ) : diffError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Failed to load differences: {diffError}</span>
                  </div>
                </div>
              ) : diffData && diffData.diffDetails ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Diff className="w-4 h-4" />
                      Changes Details
                    </h3>
                    <button
                      onClick={() => setShowDiffDetails(!showDiffDetails)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showDiffDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {showDiffDetails ? 'Hide' : 'Show'} Details
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Summary:</strong> {diffData.diffSummary}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {diffData.diffDetails.changeCount} field(s) changed: {diffData.diffDetails.fieldsChanged.join(', ')}
                    </p>
                  </div>

                  {showDiffDetails && (
                    <div className="space-y-4">
                      {Object.entries(diffData.diffDetails.changes).map(([fieldName, change]) => (
                        <div key={fieldName}>
                          {renderFieldChange(fieldName, change)}
                        </div>
                      ))}

                      {/* Text Diffs */}
                      {Object.keys(diffData.textDiffs).length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Text Differences</h4>
                          {Object.entries(diffData.textDiffs).map(([fieldName, textDiff]) => (
                            <div key={fieldName} className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                                {fieldName.replace(/([A-Z])/g, ' $1').trim()}:
                              </h5>
                              {renderTextDiff(textDiff)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-center">
                    No detailed changes available for this activity.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
