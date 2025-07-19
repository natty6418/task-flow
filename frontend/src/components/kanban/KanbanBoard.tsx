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
} from "@dnd-kit/core";
import { Board, Task, TasksByBoard } from "@/types/type";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";
import { updateBoard } from "@/services/boardService";
import { Plus } from "lucide-react";
import { Status } from "@/types/type";
import { createBoard } from "@/services/boardService";
import { Project } from "@/types/type";

interface KanbanBoardProps {
  boards: Board[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId: string;
  onAddBoard?: () => void;
  project: Project;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  boards = [],
  tasks = [],
  setTasks,
  setBoards,
  projectId,
  onAddBoard,
  project,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);


  const newBoard = {
    id: `new-board-${Date.now()}`,
    projectId,
    name: "New Board",
    description: "",
    status: Status.TODO,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    project
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
    setActiveTask(task || null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    // If task moved to a different board
    const taskId = active.id as string;
    const newBoardId = over.id as string;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, boardId: newBoardId } : task
      )
    );
    const task = tasks.find((task) => task.id === taskId);
    const updatedBoard = boards.find((board) => board.id === newBoardId);
    const prevBoard = boards.find((board) => board.id === task?.boardId);

    if (updatedBoard && task) {
      updateBoard({
        id: updatedBoard.id,
        name: updatedBoard.name,
        projectId: updatedBoard.projectId,
        description: updatedBoard.description,
        status: updatedBoard.status,
        tasks: [
          ...updatedBoard.tasks,
          {
            ...task,
            boardId: newBoardId,
          },
        ],
      }).catch((err) => {
        console.error("Error updating board:", err);
        // Optionally, you can revert the task state here if needed
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, boardId: task.boardId } : t
          )
        );
      });
    }
    if (prevBoard && task) {
      updateBoard({
        id: prevBoard.id,
        name: prevBoard.name,
        projectId: prevBoard.projectId,
        description: prevBoard.description,
        status: prevBoard.status,
        tasks: prevBoard.tasks.filter((t) => t.id !== taskId),
      }).catch((err) => {
        console.error("Error updating board:", err);
        // Optionally, you can revert the task state here if needed
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, boardId: prevBoard.id } : t
          )
        );
      });
    }
  };
  const handleAddTaskToBoard = (boardId: string, taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, boardId } : task))
    );
    const task = tasks.find((task) => task.id === taskId);
    const updatedBoard = boards.find((board) => board.id === boardId);
    if (updatedBoard && task) {
      updateBoard({
        id: updatedBoard.id,
        name: updatedBoard.name,
        projectId: updatedBoard.projectId,
        description: updatedBoard.description,
        status: updatedBoard.status,
        tasks: [...updatedBoard.tasks, task],
      }).catch((err) => {
        console.error("Error updating board:", err);
        // Optionally, you can revert the task state here if needed
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, boardId: task.boardId } : t
          )
        );
      });
    }
  };

  const addBoard = async () => {
    setBoards((prev) => [...prev, newBoard]);
    try{
      await createBoard(newBoard);
    } catch (error) {
      console.error("Error creating board:", error);
      // Optionally, you can revert the board state here if needed
      setBoards((prev) => prev.filter((b) => b.id !== newBoard.id));
    }
  }

  return (
    <div className=" bg-gradient-to-br from-slate-50 to-gray-100 p-6 ">
      {/* Modern Header */}
      <div className="mb-6">
        
        {/* Progress Indicator */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600">
              {tasks.filter((t) => t.status === "DONE").length} / {tasks.length}{" "}
              completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  tasks.length > 0
                    ? (tasks.filter((t) => t.status === "DONE").length /
                        tasks.length) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

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
                  onAddTaskToBoard={(boardId, taskId) => {
                    handleAddTaskToBoard(boardId, taskId);
                  }}
                />
              </div>
            ))}

            {onAddBoard && boards.length !== 0 && (
              <div className="flex items-center justify-center w-20 flex-shrink-0">
                <button
                  onClick={addBoard}
                  className="flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-700 transition-colors w-16 h-16 shadow-lg hover:shadow-xl transform hover:scale-105"
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
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
