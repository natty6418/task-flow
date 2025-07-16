// components/kanban/KanbanBoard.tsx
import React, { useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Board, Task, TasksByBoard } from '@/types/type';
import BoardColumn from './BoardColumn';
import { updateBoard } from '@/services/boardService';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  boards: Board[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onAddBoard?: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boards = [], tasks = [], setTasks, onAddBoard }) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);

  const sortedBoards = useMemo(() => {
    return boards.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }
  , [boards]);

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
    setActiveTaskId(event.active.id as string);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over || active.id === over.id) return;

    // If task moved to a different board
    const taskId = active.id as string;
    const newBoardId = over.id as string;

    setTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, boardId: newBoardId } : task))
    );
    const task = tasks.find(task => task.id === taskId);
    const updatedBoard = boards.find(board => board.id === newBoardId);
    const prevBoard = boards.find(board => board.id === task?.boardId);

    if (updatedBoard && task) {
      updateBoard({
        id: updatedBoard.id,
        name: updatedBoard.name,
        projectId: updatedBoard.projectId,
        description: updatedBoard.description,
        status: updatedBoard.status,
        tasks: [...updatedBoard.tasks, task],
      }).catch(err =>{
        console.error('Error updating board:', err);
        // Optionally, you can revert the task state here if needed
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, boardId: task.boardId } : t)));
      })
    }
    if (prevBoard && task) {
      updateBoard({
        id: prevBoard.id,
        name: prevBoard.name,
        projectId: prevBoard.projectId,
        description: prevBoard.description,
        status: prevBoard.status,
        tasks: prevBoard.tasks.filter(t => t.id !== taskId),
      }).catch(err=>{
        console.error('Error updating board:', err);
        // Optionally, you can revert the task state here if needed
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, boardId: prevBoard.id } : t)));
      })
    }

  };
  const handleAddTaskToBoard = (boardId: string, taskId: string) => {
    setTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, boardId } : task))
    );
    const task = tasks.find(task => task.id === taskId);
    const updatedBoard = boards.find(board => board.id === boardId);
    if (updatedBoard && task) {
      updateBoard({
        id: updatedBoard.id,
        name: updatedBoard.name,
        projectId: updatedBoard.projectId,
        description: updatedBoard.description,
        status: updatedBoard.status,
        tasks: [...updatedBoard.tasks, task],
      }).catch(err=>{
        console.error('Error updating board:', err);
        // Optionally, you can revert the task state here if needed
        setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, boardId: task.boardId } : t)));
      })
    }
    
  };

  return (
    <div className="overflow-x-auto p-4">
      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {sortedBoards.map(board => (
            <BoardColumn
              key={board.id}
              board={board}
              tasks={tasksByBoard[board.id] || []}
              availableTasks={tasks.filter(task => !task.boardId)}
              activeTaskId={activeTaskId}
              onAddTaskToBoard={(boardId, taskId) => {
                handleAddTaskToBoard(boardId, taskId);
              }}
            />
          ))}
          
          {/* Add Board Column */}
          {onAddBoard && (
            <div className="min-w-72 bg-gray-50 border-l border-gray-200 flex flex-col items-center justify-center p-8">
              <button
                onClick={onAddBoard}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                  Add Board
                </span>
              </button>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
