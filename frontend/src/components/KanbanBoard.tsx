import { Task, Status, Board } from "@/types/type";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { useDroppable, useDraggable  } from '@dnd-kit/core';

type Column = {
    id: string;
    title: string;
    status: Status; // maps to task.status
  };

  type KBoard = {
    columns: Column[];
    tasks: Task[];
  };



  function TaskCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: task.id,
    });
  
    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="bg-white rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
      >
        <h3 className="font-semibold text-gray-800">{task.title}</h3>
      </div>
    );
  }
  
  function KanbanColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
    const { setNodeRef } = useDroppable({
      id: column.status, // Droppable ID = status (e.g., TODO, IN_PROGRESS, DONE)
    });
  
    return (
      <div ref={setNodeRef} className="flex flex-col bg-gray-50 rounded-lg p-4 min-w-[300px] shadow">
        <h2 className="font-bold text-gray-700 text-lg mb-4">{column.title}</h2>
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  }
  

function KanbanBoard({ board }: { board: Board }) {
    console.log("board", board);
  const [tasks, setTasks] = useState(board.tasks);

  const generateKboard = (board: Board): KBoard => {
    // Create unique columns based on task statuses
    const uniqueStatuses = Array.from(new Set(board.tasks.map((task) => task.status)));
  
    const columns: Column[] = uniqueStatuses.map((status) => ({
      id: status,
      title: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      status,
    }));
  
    return {
      columns,
      tasks: board.tasks,
    };
  };
    const kboard = generateKboard(board);  

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id as Status;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex overflow-x-auto gap-6 p-6">
        {kboard.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((task) => task.status === column.status)}
          />
        ))}
      </div>
    </DndContext>
  );
}
  
export default KanbanBoard;