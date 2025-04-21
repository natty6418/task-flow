// components/kanban/TaskCard.tsx
import React from 'react';
import { Calendar } from 'lucide-react'; // Example icons (npm install lucide-react)
import { Task, Priority } from '@/types/type';

interface TaskCardProps {
  task: Task;
}

// Helper function to get priority styling
const getPriorityClass = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH: return 'border-l-4 border-orange-500';
    case Priority.MEDIUM: return 'border-l-4 border-yellow-500';
    case Priority.LOW: return 'border-l-4 border-blue-500';
    default: return 'border-l-4 border-gray-300';
  }
};

// Helper function to format date (optional)
const formatDate = (date?: Date): string | null => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const formattedDueDate = formatDate(task.dueDate);

  return (
    <div className={`bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-3 ${getPriorityClass(task.priority)}`}>
      <h4 className="text-sm font-medium text-gray-800 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          {formattedDueDate && (
            <>
              <Calendar size={14} />
              <span>{formattedDueDate}</span>
            </>
          )}
        </div>
        {task.assignedTo ? (
          <div title={task.assignedTo.name || 'Assignee'} className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold">
            {/* Basic Avatar Placeholder - Replace with Image if available */}
            {
            // task.assignedTo.avatarUrl ? (
            //      <img src={task.assignedTo.avatarUrl} alt={task.assignedTo.name || 'Avatar'} className="h-full w-full rounded-full object-cover" />
            // ) : (
            //     task.assignedTo.name?.charAt(0).toUpperCase() || <UserCircle size={14} />
            // )
            }
          </div>
        ) : (
          <div className="h-5 w-5"></div> // Placeholder to maintain layout
        )}
      </div>
    </div>
  );
};

export default TaskCard;