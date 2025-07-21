import { Task, Board } from "@/types/type";

export default function TaskPicker({
  tasks,
  board,
  setShowTaskPicker,
  handleAddTaskToBoard,
}: {
  tasks: Task[];
  board: Board;
  setShowTaskPicker: React.Dispatch<React.SetStateAction<string | null>>;
  handleAddTaskToBoard: (boardId: string, task: Task) => void;
}) {
  return (
    <ul className="mt-2 bg-white border rounded-lg shadow p-2 space-y-2">
      {tasks.length === 0 ? (
        <li className="p-4 text-center text-gray-500 text-sm">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>No tasks available</span>
            <span className="text-xs text-gray-400">Create a task first to add it to this board</span>
          </div>
        </li>
      ) : (
        tasks.map((task) => (
          <li
            key={task.id}
            onClick={() => {
              handleAddTaskToBoard(board.id, task);
              setShowTaskPicker(null);
            }}
            className="cursor-pointer hover:bg-gray-100 p-2 rounded text-sm"
          >
            {task.title}
          </li>
        ))
      )}
    </ul>
  );
}
