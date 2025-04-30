import React, { useState } from 'react';
import { Board, Task } from '@/types/type'; // Adjust path
import TaskCard from './TaskCard';

interface BoardColumnProps {
  board: Board;
  tasks: Task[];
  availableTasks?: Task[]; // Add available tasks to choose from
  onAddTaskToBoard?: (boardId: string, taskId: string) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({ board, tasks, availableTasks = [], onAddTaskToBoard }) => {
  const [showTaskList, setShowTaskList] = useState(false);

  const handleAddTask = (taskId: string) => {
    onAddTaskToBoard?.(board.id, taskId);
    setShowTaskList(false); // hide after selecting
  };

  return (
    <div className="flex flex-col w-72 md:w-80 flex-shrink-0 bg-gray-100 rounded-lg shadow">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {board.name}
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Add Task Button */}
      <div className="p-2">
        <button
          onClick={() => setShowTaskList(prev => !prev)}
          className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white rounded p-2"
        >
          {showTaskList ? "Cancel" : "Add Task"}
        </button>
      </div>

      {/* Available Tasks Dropdown */}
      {showTaskList && (
        <div className="p-2 max-h-40 overflow-y-auto">
          {availableTasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center">No available tasks</p>
          ) : (
            availableTasks.map(task => (
              <div
                key={task.id}
                className="p-2 bg-white rounded mb-2 cursor-pointer hover:bg-gray-100 text-sm"
                onClick={() => handleAddTask(task.id)}
              >
                {task.title}
              </div>
            ))
          )}
        </div>
      )}

      {/* Task List */}
      <div className="flex-grow p-3 overflow-y-auto min-h-[100px]" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">No tasks yet</p>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

export default BoardColumn;
