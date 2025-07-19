import { useState, useEffect, useRef } from "react";
import { Task, Priority, Status } from "@/types/type";
import { Circle, Calendar, Flag, MoreVertical, CircleCheck, ChevronDown } from "lucide-react";
import { format } from "date-fns";

type TaskItemProps = {
  task: Task;
  onUpdateTask: (taskId: string, field: keyof Task, value: Task[keyof Task]) => void;
  onRemoveTask: (taskId: string) => void;
  isUpdating: boolean;
};

const statusColor = {
  [Status.TODO]: "text-orange-800",
  [Status.IN_PROGRESS]: "text-blue-800",
  [Status.DONE]: "text-green-800",
};

const priorityColor = {
  [Priority.HIGH]: "text-red-800 ",
  [Priority.MEDIUM]: "text-yellow-800 ",
  [Priority.LOW]: "text-green-800 ",
};

function TaskItem({ task, onUpdateTask, onRemoveTask, isUpdating }: TaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleEditField = (field: keyof Task, value: Task[keyof Task]) => {
    onUpdateTask(task.id, field, value);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setPriorityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync local input with parent state if it's not focused
  useEffect(() => {
    if (titleInputRef.current && document.activeElement !== titleInputRef.current) {
      titleInputRef.current.value = task.title;
    }
  }, [task.title]);

  const EditableTitle = () => {
    return (
      <div className="flex items-center gap-3 flex-1 w-1/2 ">
        {task.status === Status.DONE ? (
          <CircleCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-blue-500 flex-shrink-0" />
        )}
        <input
          ref={titleInputRef}
          defaultValue={task.title}
          onBlur={(e) => handleEditField('title', e.target.value)}
          disabled={isUpdating}
          className={`font-medium text-gray-900 w-full ${isUpdating ? 'cursor-not-allowed bg-gray-100' : ''}`}
          style={{
            outline: 'none',
            border: 'none',
            background: 'transparent',
            boxShadow: 'none'
          }}
        />
      </div>
    );
  };

  return (
    <div className="relative flex w-full items-center justify-between border-b border-gray-200 py-2">
      <EditableTitle />
      <div className="flex items-center gap-5 text-gray-600 text-sm flex-shrink-0">
        <div className="flex items-center gap-1 min-w-[80px]">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            disabled={isUpdating}
            value={task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""}
            onChange={(e) => handleEditField("dueDate", e.target.value ? new Date(e.target.value) : undefined)}
            className={`bg-transparent outline-none text-xs ${isUpdating ? 'cursor-not-allowed' : ''}`}
          />
        </div>
        <div ref={priorityDropdownRef} className="relative min-w-[120px]">
          <button
            onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors hover:shadow-sm ${priorityColor[task.priority]} w-full justify-center ${isUpdating ? 'cursor-not-allowed bg-gray-100' : ''}`}
          >
            <Flag className="w-3 h-3" />
            <span>{task.priority}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {priorityDropdownOpen && (
            <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              {Object.values(Priority).map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    handleEditField("priority", priority);
                    setPriorityDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors ${
                    priority === task.priority ? priorityColor[priority] : 'text-gray-700'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>
        <div ref={statusDropdownRef} className="relative min-w-[120px]">
          <button
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors hover:shadow-sm ${statusColor[task.status]} w-full justify-center ${isUpdating ? 'cursor-not-allowed bg-gray-100' : ''}`}
          >
            <span>{task.status.replace("_", " ")}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {statusDropdownOpen && (
            <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
              {Object.values(Status).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    handleEditField("status", status);
                    setStatusDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors ${
                    status === task.status ? statusColor[status] : 'text-gray-700'
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        disabled={isUpdating}
        className={`hover:bg-gray-200 p-1 rounded ml-2 ${isUpdating ? 'cursor-not-allowed' : ''}`}
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-24 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10">
          <button
            onClick={() => {
              onRemoveTask(task.id);
              setMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Remove Task
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
