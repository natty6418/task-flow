// components/kanban/KanbanBoard.tsx
import React, { useMemo } from 'react';
import { Board, Task, TasksByBoard } from '@/types/type'; // Adjust path
import BoardColumn from './BoardColumn';

interface KanbanBoardProps {
  boards: Board[];
  tasks: Task[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boards = [], tasks = [] }) => {

  // Group tasks by boardId for efficient lookup
  const tasksByBoard = useMemo((): TasksByBoard => {
    return tasks.reduce((acc, task) => {
      const boardId = task.boardId;
      if (boardId) {
        if (!acc[boardId]) {
          acc[boardId] = [];
        }
        acc[boardId].push(task);
      }
      return acc;
    }, {} as TasksByBoard);
  }, [tasks]);

  // Sort boards (optional - based on creation date or a specific order field)
  const sortedBoards = useMemo(() => {
      // Example: Sort by createdAt date. Add specific order logic if needed.
      return [...boards].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [boards]);


  return (
    // Outer container enabling horizontal scrolling
    <div className="flex overflow-x-auto p-4 space-x-4 bg-gradient-to-br from-white to-gray-50 min-h-[calc(100vh-100px)]"> {/* Adjust min-h */}
      {sortedBoards.length > 0 ? (
          sortedBoards.map(board => (
            <BoardColumn
              key={board.id}
              board={board}
              tasks={tasksByBoard[board.id] || []} // Pass tasks for this specific board
            />
          ))
        ) : (
            <div className="flex items-center justify-center w-full h-64">
                <p className="text-gray-500">No boards found for this project.</p>
                {/* Optional: Add button to create a board */}
            </div>
        )
      }
      {/* Optional: Placeholder/Button to add a new column */}
      {/*
      <div className="w-72 flex-shrink-0">
          <button className="w-full h-10 bg-gray-200/50 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              + Add another list
          </button>
      </div>
      */}
    </div>
  );
};

export default KanbanBoard;