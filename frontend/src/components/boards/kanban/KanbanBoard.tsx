// components/kanban/KanbanBoard.tsx
import React, { useMemo } from "react";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import { Board, Task, TasksByBoard, Status } from "@/types/type";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";
import { updateBoard } from "@/services/boardService";
import { Plus, Trash2 } from "lucide-react";
import { createBoard, deleteBoard } from "@/services/boardService";

interface KanbanBoardProps {
  boards: Board[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId: string;
  onAddBoard?: () => void;
  
}

const DeleteZone = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'delete-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-3 px-6 py-4 rounded-full transition-all duration-300 ${
        isOver ? 'bg-red-500 text-white shadow-2xl scale-110' : 'bg-white/80 backdrop-blur-sm text-gray-600 shadow-lg'
      }`}
    >
      <Trash2 className={`w-6 h-6 transition-transform duration-300 ${isOver ? 'rotate-12' : ''}`} />
      <span className="font-semibold text-lg">{isOver ? 'Release to delete' : 'Drag here to delete'}</span>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  boards = [],
  tasks = [],
  setTasks,
  setBoards,
  projectId,
  onAddBoard,
  
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [loadingBoards, setLoadingBoards] = React.useState<Set<string>>(new Set());

  // TODO: Implement default boards initialization without causing infinite loops
  // React.useEffect(() => {
  //   const initializeDefaultBoards = async () => {
  //     if (projectId && boards.length !== undefined) {
  //       await ensureDefaultBoards(projectId, boards, setBoards);
  //     }
  //   };
    
  //   initializeDefaultBoards();
  // }, [projectId, boards, setBoards]);
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

  const newBoard = {
    id: `new-board-${Date.now()}`,
    projectId,
    name: getUniqueboardName(),
    description: "",
    status: Status.TODO,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    
  }

  const sortedBoards = useMemo(() => {
    return boards.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [boards]);

  const tasksByBoard = useMemo((): TasksByBoard => {
    return tasks.reduce((acc, task) => {
      if (task.boardId) {
        if (!acc[task.boardId]) acc[task.boardId] = [];
        acc[task.boardId].push(task);
      }
      return acc;
    }, {} as TasksByBoard);
  }, [tasks]);

  const onDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
      event.active.data.current = {
        boardId: task.boardId,
      };
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    if (over.id === 'delete-zone') {
      handleRemoveTaskFromBoard(active.data.current?.boardId, active.id as string);
      return;
    }
    
    if (active.id === over.id) return;

    // If task moved to a different board
    const taskId = active.id as string;
    const newBoardId = over.id as string;
    const task = tasks.find((task) => task.id === taskId);
    const newBoard = boards.find((board) => board.id === newBoardId);

    if (!task || !newBoard) return;

    // Update task with new board assignment and status (if board has specific status)
    const updatedTask = {
      ...task,
      boardId: newBoardId,
      status: newBoard.status || task.status // Use board's status if available, otherwise keep current
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? updatedTask : t
      )
    );
    const updatedBoard = boards.find((board) => board.id === newBoardId);
    const prevBoard = boards.find((board) => board.id === task?.boardId);

    // Set loading state for affected boards
    setLoadingBoards((prev) => {
      const newSet = new Set(prev);
      if (updatedBoard) newSet.add(updatedBoard.id);
      if (prevBoard) newSet.add(prevBoard.id);
      return newSet;
    });

    const updateTasks = [];

    // Update the new board (add task)
    
    // Update the previous board (remove task)
    if (prevBoard && task) {
      const updatePrevBoard = async () => {
        try {
          await updateBoard({
            ...prevBoard,
            tasks: prevBoard.tasks.filter((t) => t.id !== taskId),
          });
        } catch (err) {
          console.error("Error updating previous board:", err);
          // Revert the task state on error
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, boardId: prevBoard.id, status: task.status } : t
            )
          );
        } finally {
          setLoadingBoards((prev) => {
            const newSet = new Set(prev);
            newSet.delete(prevBoard.id);
            return newSet;
          });
        }
      };
      updateTasks.push(updatePrevBoard());
    }
    
    if (updatedBoard && task) {
      const updateNewBoard = async () => {
        try {
          await updateBoard({
            ...updatedBoard,
            tasks: [...(updatedBoard.tasks || []), updatedTask],
          });
          console.log("Task moved:", updatedTask, "to board:", updatedBoard);
        } catch (err) {
          console.error("Error updating board:", err);
          // Revert the task state on error
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? task : t
            )
          );
        } finally {
          setLoadingBoards((prev) => {
            const newSet = new Set(prev);
            newSet.delete(updatedBoard.id);
            return newSet;
          });
        }
      };
      updateTasks.push(updateNewBoard());
    }
    // Execute all updates in parallel
    await Promise.all(updateTasks);
  };
  const handleAddTaskToBoard = async (boardId: string, taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, boardId } : task))
    );
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? { ...board, tasks: [...(board.tasks || []), ...(tasks.filter((t) => t.id === taskId))] }
          : board
      )
    );
    const task = tasks.find((task) => task.id === taskId);
    const updatedBoard = boards.find((board) => board.id === boardId);
    
    if (updatedBoard && task) {
      setLoadingBoards((prev) => new Set(prev).add(boardId));
      
      try {
        await updateBoard({
          ...updatedBoard,
          tasks: [...updatedBoard.tasks, { ...task, boardId }],
        });
      } catch (err) {
        console.error("Error updating board:", err);
        // Revert the task state on error
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, boardId: task.boardId } : t
          )
        );
        setBoards((prev) =>
          prev.map((b) =>
            b.id === boardId ? { ...b, tasks: b.tasks.filter((t) => t.id !== taskId) } : b
          )
        );
      } finally {
        setLoadingBoards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(boardId);
          return newSet;
        });
      }
    }
  };

  const handleRemoveTaskFromBoard = async (boardId: string, taskId: string) => {
    // Optimistically remove task from board (only update tasks state)
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, boardId: undefined } : task))
    );
    
    const task = tasks.find((task) => task.id === taskId);
    const board = boards.find((board) => board.id === boardId);
    
    if (board && task) {
      setLoadingBoards((prev) => new Set(prev).add(boardId));
      
      try {
        await updateBoard({
          ...board,
          tasks: board.tasks.filter((t) => t.id !== taskId),
        });
        console.log("Task removed:", task, "from board:", board);
      } catch (err) {
        console.error("Error removing task from board:", err);
        // Revert the task state on error
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, boardId } : t
          )
        );
      } finally {
        setLoadingBoards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(boardId);
          return newSet;
        });
      }
    }
  };

  const addBoard = async () => {
    setBoards((prev) => [...prev, newBoard]);
    try{
      console.log("Creating new board:", newBoard);
      const board = await createBoard(newBoard);
      setBoards((prev) => prev.map((b) => (b.id === newBoard.id ? {...board, tasks: []} : b)));
    } catch (error) {
      console.error("Error creating board:", error);
      // Optionally, you can revert the board state here if needed
      setBoards((prev) => prev.filter((b) => b.id !== newBoard.id));
    }
  }

  const handleDeleteBoard = async (boardId: string) => {
    // First, move all tasks from this board back to unassigned
    const boardTasks = tasksByBoard[boardId] || [];
    setTasks((prev) =>
      prev.map((task) =>
        task.boardId === boardId ? { ...task, boardId: undefined } : task
      )
    );

    // Remove board from state optimistically
    setBoards((prev) => prev.filter((b) => b.id !== boardId));

    // Set loading state
    setLoadingBoards((prev) => new Set(prev).add(boardId));

    try {
      await deleteBoard(boardId);
    } catch (error) {
      console.error("Error deleting board:", error);
      // Revert changes on error
      setBoards((prev) => [...prev, boards.find(b => b.id === boardId)!]);
      setTasks((prev) =>
        prev.map((task) =>
          boardTasks.some(bt => bt.id === task.id) ? { ...task, boardId } : task
        )
      );
    } finally {
      setLoadingBoards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(boardId);
        return newSet;
      });
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-6 relative">
      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(71, 85, 105, 0.6) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Modern Header */}
        {/* Kanban Columns */}
        <div className="overflow-x-auto pb-1 scrollbar-hide">
        <DndContext
          collisionDetection={closestCorners}
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-6 min-w-fit">
            {sortedBoards.map((board) => (
              <div key={board.id} className="flex-shrink-0 w-80">
                <BoardColumn
                  board={board}
                  tasks={tasksByBoard[board.id] || []}
                  availableTasks={tasks.filter((task) => !task.boardId)}
                  activeTask={activeTask}
                  setBoards={setBoards}
                  projectId={projectId}
                  isLoading={loadingBoards.has(board.id)}
                  onAddTaskToBoard={(boardId, taskId) => {
                    handleAddTaskToBoard(boardId, taskId);
                  }}
                  onDeleteBoard={handleDeleteBoard}
                />
              </div>
            ))}

            {onAddBoard && boards.length !== 0 && (
              <div className="flex items-center justify-center w-20 flex-shrink-0">
                <button
                  onClick={addBoard}
                  title="Add Board"
                  className="flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors w-16 h-16 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Add Board Column Placeholder */}
            {onAddBoard && boards.length === 0 && (
              <div className="w-80 flex-shrink-0">
                <div className="h-full bg-white/40 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 min-h-[400px] hover:border-blue-400 hover:bg-blue-50/40 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Create Your First Board
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm">
                      Start organizing your tasks with a new board
                    </p>
                    <button
                      onClick={onAddBoard}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    >
                      Create Board
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="transform rotate-3 opacity-90 shadow-2xl">
                <TaskCard task={activeTask} isActive={true} />
              </div>
            ) : null}
          </DragOverlay>
          {activeTask && <DeleteZone />}
        </DndContext>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
