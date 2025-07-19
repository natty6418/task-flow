import React, { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Board, Task, Status } from '@/types/type';
import TaskCard from './TaskCard';
import { useDebounce } from 'use-debounce';
import API from '@/services/api';

interface BoardColumnProps {
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
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[500px] ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50/70' : ''
      }`}
    >
      {/* Modern Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-3 h-3 rounded-full ${getBoardStatusClass(boardStatus)}`} />
            <h3 
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleEditBoardName(e.currentTarget.innerText)}
              className="text-sm font-bold text-gray-800 tracking-wide outline-none focus:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
            >
              {board.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTaskList(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showTaskList ? 'Cancel' : 'Add Task'}
            </button>
            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
              {tasks.length}
            </div>
          </div>
        </div>
        
        {/* Description */}
        {(board.description !== undefined || isDirty) && (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEditBoardDescription(e.currentTarget.innerText)}
            className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition-colors"
            title="Add a description..."
          >
            {board.description || 'Add a description...'}
          </div>
        )}
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
                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                    onClick={() => handleAddTask(task.id)}
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
    </div>
  );
};

export default BoardColumn;
