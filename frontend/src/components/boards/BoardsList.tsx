"use client";
import { useState } from "react";
import { Board, Task, Status } from "@/types/type";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Project } from "@/types/type";
// import API from "@/services/api";
import BoardItem from "./BoardItem";
// import KanbanBoard from "./KanbanBoard";
import { createBoard, deleteBoard } from "@/services/boardService";

export default function BoardsList({
  boards,
  tasks,
  setTasks,
  setBoards,
  projectId,
  handleAddTask,
  handleUpdateTask,
  handleRemoveTask,
  updatingTasks,
}: {
  boards: Board[];
  tasks: Task[];
  setShowAddBoardModal: (showAddBoardModal: boolean) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId: string;
  handleAddTask: () => void;
  handleUpdateTask: (
    taskId: string,
    field: keyof Task,
    value: Task[keyof Task]
  ) => void;
  handleRemoveTask: (taskId: string) => void;
  updatingTasks: Set<string>;
}) {
  const [expandedBoardId, setExpandedBoardId] = useState<string | null>(null);
  const [hoveredBoardId, setHoveredBoardId] = useState<string | null>(null);

  // TODO: Implement default boards initialization without causing infinite loops
  // useEffect(() => {
  //   const initializeDefaultBoards = async () => {
  //     if (projectId && boards.length !== undefined) {
  //       await ensureDefaultBoards(projectId, boards, setBoards);
  //     }
  //   };
  //   
  //   initializeDefaultBoards();
  // }, [projectId, boards, setBoards]);

  const handleAddBoard = async () => {
    // Generate unique board name
    const getUniqueboardName = () => {
      const baseName = "Untitled Board";
      const existingNames = boards.map(board => board.name.toLowerCase());
      
      // Check if base name is available
      if (!existingNames.includes(baseName.toLowerCase())) {
        return baseName;
      }
      
      // Find the highest number used
      let counter = 1;
      while (existingNames.includes(`${baseName.toLowerCase()} ${counter}`)) {
        counter++;
      }
      
      return `${baseName} ${counter}`;
    };

    const newBoard: Board = {
      id: uuidv4(), // temporary ID until saved to backend
      projectId: projectId,
      name: getUniqueboardName(),
      description: "",
      status: Status.TODO,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      project: {} as Project,
    };

    // Optimistic update
    setBoards((prevBoards) => [...prevBoards, newBoard]);

    try {
      const savedBoard = await createBoard(newBoard);
      // Replace the temporary board with the one from the backend
      setBoards((prevBoards) => 
        prevBoards.map(board => 
          board.id === newBoard.id ? savedBoard : board
        )
      );
    } catch (error) {
      console.error("Error adding board:", error);
      // Remove the optimistic board if save failed
      setBoards((prevBoards) => 
        prevBoards.filter(board => board.id !== newBoard.id)
      );
    }
  };

  const handleRemoveBoard = async (boardId: string) => {
    // Optimistic update - remove immediately from UI
    setBoards((prevBoards) => prevBoards.filter(board => board.id !== boardId));

    try {
      await deleteBoard(boardId);
    } catch (error) {
      console.error("Error deleting board:", error);
      // If deletion fails, we could restore the board, but for now just log the error
      // In a production app, you might want to show a toast notification and restore the board
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Boards</h2>
      </div>

      <ul className="space-y-3">
        {boards.map((board) => {
          const isExpanded = expandedBoardId === board.id;
          const isHovered = hoveredBoardId === board.id;
          return (
            <li
              key={board.id}
              className="relative p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              onMouseEnter={() => setHoveredBoardId(board.id)}
              onMouseLeave={() => setHoveredBoardId(null)}
            >
              {/* Delete button - appears on hover */}
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBoard(board.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all z-10"
                  title="Delete board"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <BoardItem
                board={board}
                isExpanded={isExpanded}
                setExpandedBoardId={setExpandedBoardId}
                setTasks={setTasks}
                setBoards={setBoards}
                projectId={projectId}
                tasks={tasks}
                handleAddTask={handleAddTask}
                handleUpdateTask={handleUpdateTask}
                handleRemoveTask={handleRemoveTask}
                updatingTasks={updatingTasks}
              />
            </li>
          );
        })}
        
        {/* Inline Add Board Card */}
        <li 
          onClick={handleAddBoard}
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 text-gray-500 group-hover:text-blue-600">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add new board</span>
          </div>
        </li>
      </ul>

      {boards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Click above to create your first board</p>
        </div>
      )}
    </div>
  );
}
