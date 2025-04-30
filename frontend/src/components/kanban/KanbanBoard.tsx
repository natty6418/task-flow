// components/kanban/KanbanBoard.tsx
import React, { useMemo, useState } from 'react';
import { Board, Task, TasksByBoard } from '@/types/type'; // Adjust path
import BoardColumn from './BoardColumn';
import NewTaskModal from '../NewTaskModal';




interface KanbanBoardProps {
  projectId: string;
  // setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  boards: Board[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boards = [], tasks = [], projectId, setTasks }) => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();

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
    
    <div className="overflow-x-auto p-4">
  <div className="flex justify-center space-x-4 w-max mx-auto">
    {sortedBoards.length > 0 ? (
      sortedBoards.map(board => (
        <BoardColumn
          key={board.id}
          board={board}
          tasks={tasksByBoard[board.id] || []}
          availableTasks={tasks.filter(task => !task.boardId)} // Filter tasks that are not assigned to any board
          onAddTaskToBoard={(boardId, taskId) => {
            setSelectedBoardId(boardId);
            // setShowAddTaskModal(true);
            console.log("Selected Board ID:", boardId);
            console.log("Task ID to add:", taskId);
            
          }}
        />
      ))
    ) : (
      <div className="flex items-center justify-center w-full h-64">
        <p className="text-gray-500">No boards found for this project.</p>
      </div>
    )}
  </div>
  {
    showAddTaskModal && (
      <NewTaskModal
        projectId={projectId}
        onClose={() => setShowAddTaskModal(false)}
        boardId={selectedBoardId}
        setTasks={setTasks}
        // projectId={projectId} // Pass projectId if needed
        // setTasks={setTasks} // Pass setTasks if needed
      />
    )}
</div>

  );
};

export default KanbanBoard;