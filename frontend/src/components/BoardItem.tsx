import { useEffect, useState } from "react";
import { Task, Board, Status } from "@/types/type";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import TaskItem from "./TaskItem";
import TaskPicker from "./TaskPicker";
import API from "@/services/api";

import { useDebounce } from 'use-debounce';


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
  projectId,
  tasks
    
    
}:{
    setExpandedBoardId: React.Dispatch<React.SetStateAction<string | null>>;
    board: Board;
    isExpanded: boolean;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId: string;
  tasks: Task[]

}) {
    const [boardTasks, setBoardTasks] = useState<Task[]>(initialBoard.tasks || []);
    const [showTaskPicker, setShowTaskPicker] = useState<string | null>(null);
    const [board, setBoard] = useState<Board>(initialBoard);
    const [debouncedBoard] = useDebounce(board, 1000);
    const [isDirty, setIsDirty] = useState(false);


    const toggleBoard = (boardId: string) => {
        setExpandedBoardId((prevId: string | null) => (prevId === boardId ? null : boardId));
        setShowTaskPicker(null); // close task picker if board changes
      };

      
      useEffect(() => {
        if (!isDirty) return;
        const updateBoard = async () => {
          console.log("Updating board:", debouncedBoard);
            try {
              const response = await API.put("/board/update", {
                id: debouncedBoard.id,
                name: debouncedBoard.name,
                description: debouncedBoard.description || "",
                status: debouncedBoard.status || Status.TODO,
                tasks: debouncedBoard.tasks || [],
                projectId,
              });
              if (response.status !== 200) {
                console.error("Error updating board:", response.data);
                return;
              }
              console.log("Board updated successfully:", response.data);
            } catch (error) {
              console.error("Error updating board:", error);
            }
          }
          if (
            JSON.stringify(debouncedBoard) === JSON.stringify(board) 
          ) {
            updateBoard();
            setIsDirty(false);
          }
        updateBoard();
    }, [debouncedBoard, isDirty, projectId, board]);
    const handleEditBoardName = (boardId: string, newName: string) => {

        setBoard((prev) => ({ ...prev, name: newName })); // Update local state
        setIsDirty(true);
        setBoards((prev) =>
          prev.map((board) =>
            board.id === boardId ? { ...board, name: newName } : board
          )
        );
      };
    
      const handleEditBoardDescription = (
        boardId: string,
        newDescription: string
      ) => {
        setBoards((prev) =>
          prev.map((board) =>
            board.id === boardId ? { ...board, description: newDescription } : board
          )
        );
        setBoard((prev) => ({ ...prev, description: newDescription })); // Update local state
        setIsDirty(true);
      };
      const handleAddTaskToBoard = (boardId: string, task: Task) => {
          setBoardTasks((prev) => ([...prev, task]));
          setBoards((prev) =>
            prev.map((board) =>
              board.id === boardId
                ? { ...board, tasks: [...(board.tasks || []), task] }
                : board
            )
          ); // Add task to the board
          setBoard((prev)=>(
            { ...prev, tasks: [...(prev.tasks || []), task] }
          ))
          setShowTaskPicker(null); // close task picker after adding
          setExpandedBoardId(boardId); // expand the board after adding a task
          setIsDirty(true);
        };
      
        const handleRemoveTaskFromBoard = (boardId: string, taskId: string) => {
          setBoardTasks((prev) => (
            prev.filter((task) => task.id !== taskId)
          ));
          setBoards((prev) =>
            prev.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    tasks: (board.tasks || []).filter((task) => task.id !== taskId),
                  }
                : board
            )
          ); // Remove task from the board
          setBoard((prev)=>(
            { ...prev, tasks: prev.tasks?.filter((task) => task.id !== taskId) }
          ))
          setExpandedBoardId(boardId); // expand the board after removing a task
          setShowTaskPicker(null); // close task picker after removing
          setIsDirty(true);
        };
    return (
        <div className="group px-4 py-3 hover:bg-gray-100 border-b">
      
      {/* Top Row: Expand/Collapse, Title, Status */}
      <div
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown 
        onClick={() => toggleBoard(board.id)}

            className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight
        onClick={() => toggleBoard(board.id)}

             className="w-5 h-5 text-gray-500" />
          )}

          {/* Editable Board Name */}
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEditBoardName(board.id, e.currentTarget.innerText)}
            className="font-semibold text-gray-900 text-base truncate outline-none"
          >
            {board.name}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[board.status]}`}
        >
          {board.status.replace("_", " ")}
        </span>
      </div>

      {/* Description */}
      {board.description !== undefined && (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEditBoardDescription(board.id, e.currentTarget.innerText)}
          className="text-sm text-gray-600 mt-2 outline-none pl-7"
        >
          {board.description || 'Add a description...'}
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
            {boardTasks.length > 0 ? (
              boardTasks.map((task: Task) => (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <TaskItem
                    task={task}
                    setTasks={setTasks}
                  />
                  <button
                    onClick={() => handleRemoveTaskFromBoard(board.id, task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-400 text-sm">No tasks yet</li>
            )}
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
                tasks={tasks}
                board={board}
                setShowTaskPicker={setShowTaskPicker}
                handleAddTaskToBoard={handleAddTaskToBoard}
              />
            )}
          </div>
        </div>
      )}
    </div>
    )
}