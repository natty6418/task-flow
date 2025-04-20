"use client";


import React from "react";
import SectionCard from "./SectionCard";
import { Task, Status, Priority } from "@/types/type";
import TaskItem from "../TaskItem";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // Make sure to install uuid: `npm install uuid`
import API from "@/services/api";


interface MyTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const MyTasks: React.FC<MyTasksProps> = ({ tasks, setTasks }) => {
  const handleAddTask = () => {
    const newTask: Task = {
      id: `temp-${uuidv4()}`,
      title: "New Task",
      description: "",
      status: Status.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    // Optimistically add to UI
    setTasks((prev) => [newTask, ...prev]);
  
    // Then send request
    const addTask = async () => {
      try {
        const response = await API.post(
          `/task/create`,
          { ...newTask },
          { withCredentials: true }
        );
  
        if (response.status !== 200) {
          throw new Error("Failed to create task");
        }
  
        const savedTask = response.data;
  
        // Replace temporary task with actual one from DB
        setTasks((prev) =>
          prev.map((task) => (task.id === newTask.id ? savedTask : task))
        );
  
      } catch (error) {
        console.error("Failed to create task:", error);
        // Optionally remove the optimistic task on error
        setTasks((prev) => prev.filter((task) => task.id !== newTask.id));
      }
    };
  
    addTask();
  };
  

  return (
    <SectionCard title="My Tasks">
      <div className="space-y-3">
        <div className="absolute right-4 top-5 flex justify-end">
          <button
            onClick={handleAddTask}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3 flex flex-wrap">
            {tasks
              .sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                return dateA - dateB;
              })
              .map((task) => (
                <div key={task.id} className="w-full p-1 rounded-lg">
                  <TaskItem task={task} setTasks={setTasks} />
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm pt-2">
            No tasks yet
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default MyTasks;
