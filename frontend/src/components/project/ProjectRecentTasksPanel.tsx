"use client";

import { CheckCircle2 } from "lucide-react";
import { Task } from "@/types/type";

interface ProjectRecentTasksPanelProps {
  tasks: Task[];
  setShowTaskModal: (show: boolean) => void;
}

export default function ProjectRecentTasksPanel({
  tasks,
  setShowTaskModal,
}: ProjectRecentTasksPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
            {tasks.slice(0, 5).length}
          </span>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Add task"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {tasks?.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tasks
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map((task) => (
              <div
                key={task.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{task.title}</p>
                    
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
            {tasks.length > 5 && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View all {tasks.length} tasks
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-3">No recent activity yet</p>
            <button
              className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setShowTaskModal(true)}
            >
              Create first task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
