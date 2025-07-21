import { useState, useEffect, useRef } from "react";
import { Task, Priority, Status } from "@/types/type";
import { Circle, Calendar, Flag, MoreVertical, CircleCheck, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        listItem: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'tiptap-list-item',
        },
      }),
      Placeholder.configure({
        placeholder: 'Click to start adding bullet points...',
      }),
    ],
    content: task.description || '',
    editable: !isUpdating,
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      // Don't save immediately, just track local changes
    },
    onBlur: ({ editor }) => {
      const content = editor.getHTML();
      const textContent = editor.getText().trim();
      
      // Only save if there's actual content
      if (textContent && textContent !== '') {
        handleEditField('description', content);
      } else {
        handleEditField('description', '');
      }
    },
   onFocus: ({ editor }) => {
  // Auto-start with bullet list if empty
  if (!editor.getText().trim()) {
   editor.chain().toggleBulletList().focus().run(); 
  }
},
  });

  // Update editor content when task description changes
  useEffect(() => {
    if (editor && task.description !== editor.getHTML()) {
      editor.commands.setContent(task.description || '');
    }
  }, [task.description, editor]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

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
          className={`font-medium text-gray-900 w-full outline-none border-none bg-transparent focus:outline-none ${isUpdating ? 'cursor-not-allowed bg-gray-100' : ''}`}
          title="Task title"
        />
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200">
      {/* Main Task Row */}
      <div className="relative flex w-full items-center justify-between py-2">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 rounded mr-2"
          title={isExpanded ? "Collapse task details" : "Expand task details"}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <EditableTitle />
        <div className="flex items-center gap-2 text-gray-600 text-sm flex-shrink-0">
          <div className="flex items-center gap-1 min-w-[60px]">
            <input
              type="date"
              disabled={isUpdating}
              value={task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""}
              onChange={(e) => handleEditField("dueDate", e.target.value ? new Date(e.target.value) : undefined)}
              className={`bg-transparent outline-none text-xs ${isUpdating ? 'cursor-not-allowed' : ''}`}
              title="Due date"
            />
          </div>
          <div ref={priorityDropdownRef} className="relative min-w-[120px]">
            <button
              onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors hover:shadow-sm ${priorityColor[task.priority]} w-full justify-center ${isUpdating ? 'cursor-not-allowed bg-gray-100' : ''}`}
              title="Priority"
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
              title="Status"
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
          title="Task options"
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

      {/* Expanded Task Details */}
      {isExpanded && (
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Description */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Description
              </label>
              <div className="tiptap-wrapper">
                <EditorContent 
                  editor={editor} 
                  className="tiptap-editor"
                />
              </div>
            </div>

            {/* Separator Line */}
            <div className="col-span-full border-t border-gray-200 mb-4"></div>

            {/* Metadata Section */}
            <div className="col-span-full">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Task Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Metadata */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="text-sm text-gray-800 font-medium">
                    {task.createdAt ? format(new Date(task.createdAt), "MMM dd, yyyy 'at' HH:mm") : 'Unknown'}
                  </p>
                </div>

                {/* Task ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Task ID
                  </label>
                  <p className="text-sm text-gray-800 font-mono font-medium">
                    {task.id}
                  </p>
                </div>

                {/* Additional fields if they exist in your Task type */}
                {task.assignedTo && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      Assigned To
                    </label>
                    <p className="text-sm text-gray-800 font-medium">
                      {typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name || task.assignedTo.email || 'Unknown'}
                    </p>
                  </div>
                )}

                {task.updatedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-800 font-medium">
                      {format(new Date(task.updatedAt), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskItem;
