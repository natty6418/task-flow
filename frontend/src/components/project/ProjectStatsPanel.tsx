"use client";

import { BarChart3, Users, CheckCircle, Layout, TrendingUp } from "lucide-react";
import { Task, ProjectMember, Board } from "@/types/type";

interface ProjectStatsPanelProps {
  tasks: Task[];
  members: ProjectMember[];
  boards: Board[];
}

export default function ProjectStatsPanel({
  tasks,
  members,
  boards,
}: ProjectStatsPanelProps) {
  const completedTasks = tasks.filter(task => task.status === 'DONE').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Project Progress</h3>
        </div>
        <TrendingUp className="w-4 h-4 text-green-500" />
      </div>

      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            {completedTasks} of {totalTasks} tasks completed
          </span>
        </div>

        {/* Stats Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Team Members</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{members.length}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Total Tasks</span>
            </div>
            <span className="text-lg font-bold text-green-600">{totalTasks}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Active Boards</span>
            </div>
            <span className="text-lg font-bold text-purple-600">{boards.length}</span>
          </div>
        </div>

        {/* Quick insights */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            {progressPercentage > 0 && (
              <p>🎯 {Math.round(progressPercentage)}% project completion</p>
            )}
            {tasks.length > 0 && (
              <p>📋 {tasks.filter(t => t.status === 'IN_PROGRESS').length} tasks in progress</p>
            )}
            {boards.length > 0 && (
              <p>🏗️ {boards.length} board{boards.length !== 1 ? 's' : ''} organizing work</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
