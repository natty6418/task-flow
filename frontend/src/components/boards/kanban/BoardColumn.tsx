import React, { useEffect, useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Board, Task, Status } from '@/types/type';
import TaskCard from './TaskCard';
import { useDebouncedCallback } from 'use-debounce';
import { Trash2 } from 'lucide-react';
import { updateBoard } from '@/services/boardService';

interface BoardColumnProps {
  activeTask?: Task | null;
  board: Board;
  tasks: Task[];
  availableTasks?: Task[];
  onAddTaskToBoard?: (boardId: string, taskId: string) => void;
  onDeleteBoard?: (boardId: string) => void;
  setBoards?: React.Dispatch<React.SetStateAction<Board[]>>;
  projectId?: string;
  isLoading?: boolean;
}



const BoardColumn: React.FC<BoardColumnProps> = React.memo(({
  board: initialBoard,
  tasks,
  availableTasks = [],
  onAddTaskToBoard,
  onDeleteBoard,
  activeTask,
  setBoards,
  projectId,
  isLoading = false,
}) => {
  const [showTaskList, setShowTaskList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: initialBoard.id });
  const [boardStatus, setBoardStatus] = useState(initialBoard.status);
  const [board, setBoard] = useState<Board>(initialBoard);
  const pendingChangesRef = useRef<Partial<Board>>({});
  const originalBoardRef = useRef<Board | null>(null);


  // Update local board state when initialBoard prop changes
  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  
  const getBoardStatusClass = (status: string): string => {
    switch (status) {
      case 'TODO':
        return 'bg-gradient-to-r from-slate-500 to-gray-500';
      case 'IN_PROGRESS':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'DONE':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
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

  const flushChanges = useDebouncedCallback(async () => {
    const changesToFlush = pendingChangesRef.current;
    pendingChangesRef.current = {};

    if (Object.keys(changesToFlush).length === 0 || !projectId || !setBoards) {
      originalBoardRef.current = null;
      return;
    }

    const payload = {
      ...board,
      ...changesToFlush,
      status: boardStatus,
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
    if (setBoards) {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === board.id ? { ...b, [field]: trimmedValue } : b
        )
      );
    }

    pendingChangesRef.current = {
      ...pendingChangesRef.current,
      [field]: trimmedValue,
    };

    flushChanges();
  };

  const handleEditBoardName = (newName: string) => {
    handleEdit('name', newName);
  };

  const handleEditBoardDescription = (newDescription: string) => {
    handleEdit('description', newDescription);
  };



  const handleAddTask = (taskId: string) => {
    onAddTaskToBoard?.(board.id, taskId);
    setShowTaskList(false);
  };

  const handleDeleteClick = () => {
    if (tasks.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      onDeleteBoard?.(board.id);
    }
  };

  const confirmDelete = () => {
    onDeleteBoard?.(board.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-500 min-h-[500px] relative ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50/70' : ''
      } ${isLoading ? 'pointer-events-none' : ''}`}
    >
      {/* Loading Overlay */}
      {/* {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-600">Updating board...</p>
          </div>
        </div>
      )} */}

      {/* Modern Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-3 h-3 rounded-full ${getBoardStatusClass(boardStatus)}`} />
            <h3 
              contentEditable={!isLoading}
              suppressContentEditableWarning
              onBlur={(e) => handleEditBoardName(e.currentTarget.innerText)}
              className={`text-sm font-bold text-gray-800 tracking-wide outline-none focus:bg-blue-50 px-2 py-1 rounded-lg transition-colors ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {board.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTaskList(prev => !prev)}
              disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={showTaskList ? 'Cancel' : 'Add Task'}
            >
              {showTaskList ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
            {onDeleteBoard && (
              <button
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Board"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
              {tasks.length}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div
          contentEditable={!isLoading}
          suppressContentEditableWarning
          onBlur={(e) => handleEditBoardDescription(e.currentTarget.innerText)}
          className={`text-xs text-gray-600 bg-gray-50 rounded-lg p-2 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition-colors ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          title="Add a description..."
        >
          {board.description || 'Add a description...'}
        </div>
      </div>

      {/* Task Selector */}
      {showTaskList && (
        <div className="p-4 border-b border-gray-200/50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-h-40 overflow-y-auto scrollbar-hide">
            {availableTasks.length === 0 ? (
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No available tasks</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {availableTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 hover:bg-blue-50 cursor-pointer transition-colors group ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                    onClick={() => !isLoading && handleAddTask(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {task.title}
                      </span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks Area */}
      <div className="p-4 flex-grow overflow-y-auto max-h-[calc(100vh-350px)] scrollbar-hide">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-2">No tasks yet</p>
              <p className="text-xs text-gray-400">Add your first task to get started</p>
            </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Board</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              This board contains {tasks.length} task{tasks.length !== 1 ? 's' : ''}. 
              Deleting the board will move all tasks back to the unassigned list.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

BoardColumn.displayName = 'BoardColumn';

export default BoardColumn;
