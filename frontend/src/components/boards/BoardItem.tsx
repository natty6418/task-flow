import { useState, useRef } from "react";
import { Task, Board, Status } from "@/types/type";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import TaskItem from "../tasks/TaskItem";
import TaskPicker from "../tasks/TaskPicker";
import { useDebouncedCallback } from "use-debounce";
import { updateBoard } from "@/services/boardService";

const statusColors = {
  [Status.TODO]: "bg-gray-100 text-gray-800",
  [Status.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [Status.DONE]: "bg-green-100 text-green-800",
};

export default function BoardItem({
  setExpandedBoardId,
  board: initialBoard,
  isExpanded,
  setTasks,
  setBoards,
  tasks,
  handleUpdateTask,
  handleRemoveTask,
  updatingTasks,
}: {
  setExpandedBoardId: React.Dispatch<React.SetStateAction<string | null>>;
  board: Board;
  isExpanded: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId: string;
  tasks: Task[];
  handleAddTask: () => void;
  handleUpdateTask: (
    taskId: string,
    field: keyof Task,
    value: Task[keyof Task]
  ) => void;
  handleRemoveTask: (taskId: string) => void;
  updatingTasks: Set<string>;
}) {
  const [boardTasks, setBoardTasks] = useState<Task[]>(
    initialBoard.tasks || []
  );
  const [showTaskPicker, setShowTaskPicker] = useState<string | null>(null);
  const [board, setBoard] = useState<Board>(initialBoard);
  const pendingChangesRef = useRef<Partial<Board>>({});
  const originalBoardRef = useRef<Board | null>(null);

  const toggleBoard = (boardId: string) => {
    setExpandedBoardId((prevId: string | null) =>
      prevId === boardId ? null : boardId
    );
    setShowTaskPicker(null); // close task picker if board changes
  };

  const flushChanges = useDebouncedCallback(async () => {
    const changesToFlush = pendingChangesRef.current;
    pendingChangesRef.current = {};

    if (Object.keys(changesToFlush).length === 0) {
      originalBoardRef.current = null;
      return;
    }

    const payload = {
      ...board,
      ...changesToFlush,
    };

    try {
      console.log("Updating board:", payload);
      const response = await updateBoard(payload);
      setBoards((prev) =>
        prev.map((b) => (b.id === response.id ? { ...response, tasks: b.tasks } : b))
      );
      originalBoardRef.current = null;
    } catch (error) {
      console.error("Error updating board:", error);
      // Rollback on failure
      if (originalBoardRef.current) {
        setBoard(originalBoardRef.current);
        setBoards(prev => prev.map(b => b.id === originalBoardRef.current!.id ? originalBoardRef.current! : b));
        originalBoardRef.current = null;
      }
    }
  }, 1500);

  const handleEdit = (field: keyof Board, value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue === board[field]) return;

    if (!originalBoardRef.current) {
      originalBoardRef.current = board;
    }

    // Optimistic UI update
    const updatedBoard = { ...board, [field]: trimmedValue };
    setBoard(updatedBoard);
    setBoards((prev) =>
      prev.map((b) =>
        b.id === board.id ? { ...b, [field]: trimmedValue } : b
      )
    );

    pendingChangesRef.current = {
      ...pendingChangesRef.current,
      [field]: trimmedValue,
    };

    flushChanges();
  };
  const handleEditBoardName = (boardId: string, newName: string) => {
    handleEdit('name', newName);
  };

  const handleEditBoardDescription = (
    boardId: string,
    newDescription: string
  ) => {
    handleEdit('description', newDescription);
  };
  const handleAddTaskToBoard = async (boardId: string, task: Task) => {
    // Update global tasks state with boardId
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, boardId } : t))
    );
    
    // Update local board tasks
    setBoardTasks((prev) => [...prev, { ...task, boardId }]);
    
    // Update boards state
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? { ...board, tasks: [...(board.tasks || []), { ...task, boardId }] }
          : board
      )
    );
    
    // Update local board state
    setBoard((prev) => ({ ...prev, tasks: [...(prev.tasks || []), { ...task, boardId }] }));
    try{
      await updateBoard({
        ...board,
        tasks: [...(board.tasks || []), { ...task, boardId }],
      });
    } catch (error) {
      console.error("Error updating board with new task:", error);
    }
    
    setShowTaskPicker(null); // close task picker after adding
    setExpandedBoardId(boardId); // expand the board after adding a task
  };

  const handleRemoveTaskFromBoard = (boardId: string, taskId: string) => {
    // Update global tasks state by removing boardId
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, boardId: undefined } : t))
    );
    
    // Update local board tasks
    setBoardTasks((prev) => prev.filter((task) => task.id !== taskId));
    
    // Update boards state
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? {
              ...board,
              tasks: (board.tasks || []).filter((task) => task.id !== taskId),
            }
          : board
      )
    );
    
    // Update local board state
    setBoard((prev) => ({
      ...prev,
      tasks: prev.tasks?.filter((task) => task.id !== taskId),
    }));
    
    setExpandedBoardId(boardId); // expand the board after removing a task
    setShowTaskPicker(null); // close task picker after removing
  };
  return (
    <div className="group px-4 py-3 hover:bg-gray-100 border-b">
      {/* Top Row: Expand/Collapse, Title, Status */}
      <div className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown
              onClick={() => toggleBoard(board.id)}
              className="w-5 h-5 text-gray-500"
            />
          ) : (
            <ChevronRight
              onClick={() => toggleBoard(board.id)}
              className="w-5 h-5 text-gray-500"
            />
          )}

          {/* Editable Board Name */}
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              handleEditBoardName(board.id, e.currentTarget.innerText)
            }
            className="font-semibold text-gray-900 text-base truncate outline-none"
          >
            {board.name}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            statusColors[board.status]
          }`}
        >
          {board.status.replace("_", " ")}
        </span>
      </div>

      {/* Description */}
      {board.description !== undefined && (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            handleEditBoardDescription(board.id, e.currentTarget.innerText)
          }
          className="text-sm text-gray-600 mt-2 outline-none pl-7"
        >
          {board.description || "Add a description..."}
        </div>
      )}

      {/* Meta Info */}
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 pl-7">
        <span>{boardTasks.length} tasks</span>
        <span>Created {new Date(board.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Expandable Task List */}
      {isExpanded && (
        <div className="mt-4 pl-7">
          <ul className="space-y-2">
            {boardTasks.length > 0 &&
              boardTasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-2"
                >
                  <TaskItem
                    task={task}
                    onUpdateTask={handleUpdateTask}
                    onRemoveTask={handleRemoveTask}
                    isUpdating={updatingTasks.has(task.id)}
                  />
                  <button
                    onClick={() => handleRemoveTaskFromBoard(board.id, task.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove task from board"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
          </ul>

          {/* Add Task Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowTaskPicker(board.id)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>

            {showTaskPicker === board.id && (
              <TaskPicker
                tasks={tasks.filter((task) => !task.boardId)}
                board={board}
                setShowTaskPicker={setShowTaskPicker}
                handleAddTaskToBoard={handleAddTaskToBoard}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
