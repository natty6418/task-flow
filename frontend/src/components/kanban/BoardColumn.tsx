// components/kanban/BoardColumn.tsx
import React from 'react';
import { Board, Task } from '@/types/type'; // Adjust path
import TaskCard from './TaskCard';

interface BoardColumnProps {
  board: Board;
  tasks: Task[];
}

const BoardColumn: React.FC<BoardColumnProps> = ({ board, tasks }) => {
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

      {/* Task List - Make it scrollable */}
      <div className="flex-grow p-3 overflow-y-auto min-h-[100px]" style={{ maxHeight: 'calc(100vh - 200px)' }}> {/* Adjust maxHeight as needed */}
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">No tasks yet</p>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        )}
        {/* Placeholder for adding new task? */}
         {/* <button className="mt-2 text-sm text-gray-500 hover:text-gray-700 w-full text-left">+ Add task</button> */}
      </div>
    </div>
  );
};

export default BoardColumn;