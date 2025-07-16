import React, { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Board, Task, Status } from '@/types/type';
import TaskCard from './TaskCard';
import { useDebounce } from 'use-debounce';
import API from '@/services/api';

interface BoardColumnProps {
  activeTaskId?: string | null;
  activeTask?: Task | null;
  board: Board;
  tasks: Task[];
  availableTasks?: Task[];
  onAddTaskToBoard?: (boardId: string, taskId: string) => void;
  setBoards?: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId?: string;
}



const BoardColumn: React.FC<BoardColumnProps> = ({
  board: initialBoard,
  tasks,
  availableTasks = [],
  onAddTaskToBoard,
  activeTaskId,
  activeTask,
  setBoards,
  projectId,
}) => {
  const [showTaskList, setShowTaskList] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: initialBoard.id });
  const [boardStatus, setBoardStatus] = useState(initialBoard.status);
  const [board, setBoard] = useState<Board>(initialBoard);
  const [debouncedBoard] = useDebounce(board, 1000);
  const [isDirty, setIsDirty] = useState(false);

  
  const getBoardStatusClass = (status: string): string => {
    switch (status) {
      case 'TODO':
        return 'border-t-2 border-t-gray-400 bg-white';
      case 'IN_PROGRESS':
        return 'border-t-2 border-t-indigo-500 bg-white';
      case 'DONE':
        return 'border-t-2 border-t-lime-500 bg-white';
      default:
        return 'border-t-2 border-t-gray-200 bg-white';
    }
  };
    useEffect(() => {
    if (tasks.some(task => task.status === 'IN_PROGRESS')) {
      setBoardStatus(Status['IN_PROGRESS']);
    }
    else if ((tasks.filter(task => task.status === 'DONE').length === tasks.length) && tasks.length > 0) {
      setBoardStatus(Status['DONE']);
    } else{
      setBoardStatus(Status['TODO']);
    }
  }, [tasks]);

  // Update board when debounced values change
  useEffect(() => {
    if (!isDirty || !projectId || !setBoards) return;
    
    const updateBoard = async () => {
      try {
        const response = await API.put("/board/update", {
          id: debouncedBoard.id,
          name: debouncedBoard.name,
          description: debouncedBoard.description || "",
          status: debouncedBoard.status || Status.TODO,
          tasks: debouncedBoard.tasks || [],
          projectId,
        });
        if (response.status === 200) {
          console.log("Board updated successfully:", response.data);
          setIsDirty(false);
        }
      } catch (error) {
        console.error("Error updating board:", error);
      }
    };
    
    updateBoard();
  }, [debouncedBoard, isDirty, projectId, setBoards]);

  const handleEditBoardName = (newName: string) => {
    setBoard((prev) => ({ ...prev, name: newName }));
    setIsDirty(true);
    if (setBoards) {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === board.id ? { ...b, name: newName } : b
        )
      );
    }
  };

  const handleEditBoardDescription = (newDescription: string) => {
    setBoard((prev) => ({ ...prev, description: newDescription }));
    setIsDirty(true);
    if (setBoards) {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === board.id ? { ...b, description: newDescription } : b
        )
      );
    }
  };



  const handleAddTask = (taskId: string) => {
    onAddTaskToBoard?.(board.id, taskId);
    setShowTaskList(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col border-r border-b border-gray-200 bg-white min-h-[500px] ${
        isOver ? 'bg-blue-100' : ''
      }`}
    >
      {/* Header with Add Button */}
      <div className={`flex flex-col gap-2 p-3 border-b border-gray-200 ${getBoardStatusClass(boardStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <h3 
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleEditBoardName(e.currentTarget.innerText)}
              className="text-sm font-semibold text-gray-700 uppercase tracking-wide outline-none focus:bg-blue-50 px-1 rounded"
            >
              {board.name}
            </h3>
            <button
              onClick={() => setShowTaskList(prev => !prev)}
              className="text-xs px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {showTaskList ? 'Cancel' : '+ Add'}
            </button>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        
        {/* Editable Description */}
        {(board.description !== undefined || isDirty) && (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEditBoardDescription(e.currentTarget.innerText)}
            className="text-xs text-gray-600 outline-none focus:bg-blue-50 px-1 rounded h-4"
          >
            {board.description || 'Add a description...'}
          </div>
        )}
      </div>

      {/* Task Selector (Dropdown) */}
      {showTaskList && (
        <div className="px-3 pt-2">
          <div className="border border-gray-200 rounded shadow-sm bg-white max-h-40 overflow-y-auto">
            {availableTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center p-2">No available tasks</p>
            ) : (
              availableTasks.map(task => (
                <div
                  key={task.id}
                  className="p-2 text-sm hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleAddTask(task.id)}
                >
                  {task.title}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="flex-grow p-3 overflow-y-auto min-h-[100px] max-h-[calc(100vh-250px)]">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">No tasks yet</p>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isActive={activeTask?.id === task.id} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BoardColumn;
