// components/kanban/TaskCard.tsx
import React from 'react';
import { Calendar } from 'lucide-react'; // Example icons (npm install lucide-react)
import { Task, Priority } from '@/types/type';
import { useDraggable } from '@dnd-kit/core';


interface TaskCardProps {
  task: Task;
  isActive: boolean;
}

// Helper function to get priority styling
const getPriorityClass = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH: return 'border-l-4 border-red-400 bg-red-50';
    case Priority.MEDIUM: return 'border-l-4 border-yellow-400 bg-yellow-50';
    case Priority.LOW: return 'border-l-4 border-green-400 bg-green-50';
    default: return 'border-l-4 border-gray-300 bg-white';
  }
};

const getPriorityBadge = (priority: Priority): { color: string; text: string } => {
  switch (priority) {
    case Priority.HIGH: return { color: 'bg-red-100 text-red-800', text: 'High' };
    case Priority.MEDIUM: return { color: 'bg-yellow-100 text-yellow-800', text: 'Medium' };
    case Priority.LOW: return { color: 'bg-green-100 text-green-800', text: 'Low' };
    default: return { color: 'bg-gray-100 text-gray-800', text: 'None' };
  }
};

const getTaskStatusClass = (status: string): { color: string; text: string } => {
  switch (status) {
    case 'TODO': return { color: 'bg-gray-100 text-gray-800', text: 'To Do' };
    case 'IN_PROGRESS': return { color: 'bg-blue-100 text-blue-800', text: 'In Progress' };
    case 'DONE': return { color: 'bg-green-100 text-green-800', text: 'Done' };
    default: return { color: 'bg-gray-100 text-gray-800', text: status };
  }
};


// Helper function to format date (optional)
const formatDate = (date?: Date): string | null => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TaskCard: React.FC<TaskCardProps> = ({ task, isActive }) => {
  const formattedDueDate = formatDate(task.dueDate);
  const statusInfo = getTaskStatusClass(task.status);
  const priorityInfo = getPriorityBadge(task.priority);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
        getPriorityClass(task.priority)
      } ${isActive ? 'opacity-50 transform rotate-3' : 'opacity-100 hover:scale-105'}`}
      {...(transform && !isActive && { 
        style: { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } 
      })}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">
            {task.title}
          </h4>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color} flex-shrink-0`}>
            {statusInfo.text}
          </span>
        </div>
        
        
        
        {/* Priority Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityInfo.color}`}>
            {priorityInfo.text}
          </span>
          
          {/* Due Date */}
          {formattedDueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              <span className={isOverdue ? 'font-semibold' : 'font-normal'}>
                {formattedDueDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <div 
              title={task.assignedTo.name || 'Assignee'} 
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold shadow-sm"
            >
              {task.assignedTo.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
        </div>
        
        {/* Task ID or additional info */}
        <div className="text-xs text-gray-400 font-mono">
          #{task.id.slice(-6)}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;