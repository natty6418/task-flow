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
      {tasks.map((task) => (
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
      ))}
    </ul>
  );
}
