"use client";

import { CheckSquare, Plus, Filter, Search } from "lucide-react";
import { Task, ProjectMember } from "@/types/type";
import TaskItem from "../tasks/TaskItem";
import { useState } from "react";


interface ProjectTasksSectionProps {
  tasks: Task[];
  
  handleAddTask: () => void;
  handleUpdateTask: (taskId: string, field: keyof Task, value: Task[keyof Task]) => void;
  handleRemoveTask: (taskId: string) => void;
  updatingTasks: Set<string>;
  members: ProjectMember[];
}

export default function ProjectTasksSection({
  tasks, 
  handleAddTask,
  handleUpdateTask,
  handleRemoveTask,
  updatingTasks,
  members,
}: ProjectTasksSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return dateA - dateB;
  });

  const taskCounts = {
    all: tasks.length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
  };
 
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center  p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {tasks.length}
          </span>
        </div>
       
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              aria-label="Filter tasks by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All ({taskCounts.all})</option>
              <option value="TODO">To Do ({taskCounts.TODO})</option>
              <option value="IN_PROGRESS">In Progress ({taskCounts.IN_PROGRESS})</option>
              <option value="DONE">Done ({taskCounts.DONE})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4">
        {sortedTasks.length > 0 ? (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div key={task.id} className="">
                <TaskItem task={task} onUpdateTask={handleUpdateTask} onRemoveTask={handleRemoveTask} isUpdating={updatingTasks.has(task.id)} projectMembers={members}/>
              </div>
            ))}
          <button
            onClick={handleAddTask}
            className="flex items-center gap-2 w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
          >
          <Plus className="w-4 h-4" />
          <span>Add task...</span>
        </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all" ? "No matching tasks" : "No tasks yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Create your first task to get started"
              }
            </p>
            {(!searchQuery && statusFilter === "all") && (
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create your first task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
