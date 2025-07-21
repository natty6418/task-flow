import TaskItem from "./TaskItem";
import { Task } from "@/types/type";
import {CheckCircle2} from "lucide-react";

export default function TasksList({ tasks, setTasks, setShowAddTaskModal }: { tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, setShowAddTaskModal: (showAddMemberModal : boolean) => void }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
        </div>
        <span className="text-sm text-gray-500">{tasks.length} total</span>
      </div>

      {tasks?.length > 0 ? (
        <div className="space-y-3 flex flex-wrap">
          {tasks.sort((a: Task, b: Task) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return dateA - dateB;
          }).map(task => (
            <div
            key={task.id}
            className="w-full p-4 bg-gray-50 rounded-lg"
            >

              <TaskItem
                key={task.id}
                task={task}
                setTasks = {setTasks} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No tasks yet</p>
          <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => setShowAddTaskModal(true)}
          >
            Create your first task
          </button>
        </div>
      )}

    </div>
  );
}