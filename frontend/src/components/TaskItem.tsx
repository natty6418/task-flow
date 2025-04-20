import { useState, useEffect } from 'react';
import { Task, Priority, Status } from '@/types/type';
import { Circle, Calendar, Flag, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import API from '@/services/api';
import { useDebounce } from 'use-debounce';


type TaskItemProps = {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const statusColor = {
  [Status.TODO]: 'bg-gray-100 text-gray-800',
  [Status.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [Status.DONE]: 'bg-green-100 text-green-700',
};

function TaskItem({ task, setTasks }: TaskItemProps) {
    const [initialTask, setInitialTask] = useState<Task>(task);
    const [debouncedTask] = useDebounce(initialTask, 1000);
    const [isDirty, setIsDirty] = useState(false);



  useEffect(() => {
    if (!isDirty) return;
    const updateTask = async () => {
      try {
        const res = await API.put(`/task/update`, debouncedTask);
        if (res.status !== 200) {
          console.error('Error updating task:', res.data);
          return;
        }
        console.log('Task updated successfully:', res.data);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    };

      if (JSON.stringify(debouncedTask) === JSON.stringify(initialTask)) {
        updateTask();
        setIsDirty(false);
      }

  }, [debouncedTask, isDirty, initialTask]);

  const handleEditField = (field: keyof Task, value: string | Date | Priority | Status | Task['assignedTo']) => {
    setTasks((prev) => {
      const updatedTasks = prev.map((t) => (t.id === initialTask.id ? { ...t, [field]: value } : t));
      return updatedTasks;
    });
    setInitialTask((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  };

  return (
    <div className="flex w-full items-center justify-between border-b border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
      {/* Left Section */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Circle className="w-4 h-4 text-blue-500 flex-shrink-0" />
        
        {/* Editable Title */}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEditField('title', e.currentTarget.innerText)}
          className="font-medium text-gray-900 truncate max-w-[150px] outline-none"
        >
          {initialTask.title}
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex items-center gap-5 text-gray-600 text-sm flex-shrink-0">
        {/* Assignee */}
    

        {/* Due Date */}
        <div className="flex items-center gap-1 min-w-[80px]">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={initialTask.dueDate ? format(new Date(initialTask.dueDate), 'yyyy-MM-dd') : ''}
            onChange={(e) => handleEditField('dueDate', e.target.value)}
            className="bg-transparent outline-none text-xs"
          />
        </div>

        {/* Priority */}
        <div className="flex items-center gap-1 min-w-[60px]">
          <Flag className="w-4 h-4" />
          <select
            value={initialTask.priority}
            onChange={(e) => handleEditField('priority', e.target.value as Priority)}
            className="bg-transparent text-xs outline-none"
          >
            {Object.values(Priority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusColor[initialTask.status]} min-w-[120px]`}>
          <select
            value={initialTask.status}
            onChange={(e) => handleEditField('status', e.target.value as Status)}
            className="bg-transparent text-xs outline-none"
          >
            {Object.values(Status).map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Comments (future use) */}
        {
        //     <div className="flex items-center gap-1 min-w-[40px]">
        //   <MessageSquare className="w-4 h-4" />
        // </div>
        }
      </div>

      {/* More Options */}
      <button className="hover:bg-gray-200 p-1 rounded ml-2">
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}

export default TaskItem;
