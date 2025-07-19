"use client";

import React, { useState, useCallback, useRef } from "react";
import { Task, Status, Priority } from "@/types/type";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import API from "@/services/api";
import TaskItem from "../TaskItem";
import SectionCard from "./SectionCard";
import { useDebouncedCallback } from "use-debounce";

interface UnifiedTaskPanelProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  filteredDate?: Date | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

const UnifiedTaskPanel: React.FC<UnifiedTaskPanelProps> = ({
  tasks,
  setTasks,
  filteredDate,
  totalTasks,
  completedTasks,
  inProgressTasks,
}) => {
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());
  const pendingChangesRef = useRef<Record<string, Partial<Task>>>({});
  const originalTasksRef = useRef<Record<string, Task>>({});

  const flushChanges = useDebouncedCallback(async () => {
    const changesToFlush = { ...pendingChangesRef.current };
    pendingChangesRef.current = {};

    if (Object.keys(changesToFlush).length === 0) return;

    const updatePromises = Object.entries(changesToFlush).map(
      async ([taskId, changes]) => {
        const originalTask = originalTasksRef.current[taskId];
        // The backend requires the title, so we ensure it's part of the payload.
        // We get it from the original task snapshot to avoid issues with stale state.
        const payload = {
          id: taskId,
          title: originalTask?.title,
          ...changes,
        };

        try {
          const response = await API.put(`/task/update`, payload);
          if (response.status !== 200) {
            throw new Error(`Failed to update task ${taskId}`);
          }
          // Success: Update the task with server's response
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId ? response.data : task
            )
          );
          delete originalTasksRef.current[taskId];
        } catch (error) {
          console.error(error);
          // Failure: Rollback to the original state
          if (originalTask) {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.id === taskId ? originalTask : task
              )
            );
            delete originalTasksRef.current[taskId];
          }
        } finally {
          setUpdatingTasks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }
      }
    );

    await Promise.all(updatePromises);
  }, 1500);

  const handleUpdateTask = (
    taskId: string,
    field: keyof Task,
    value: Task[keyof Task]
  ) => {
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    // Check if the value has actually changed
    if (currentTask[field] === value) {
      return; // No change, don't do anything
    }

    // Store the original task state if this is the first change in a batch
    if (!originalTasksRef.current[taskId]) {
      originalTasksRef.current[taskId] = currentTask;
    }

    // Optimistic UI update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, [field]: value, updatedAt: new Date() }
          : task
      )
    );

    setUpdatingTasks((prev) => new Set(prev).add(taskId));

    pendingChangesRef.current[taskId] = {
      ...pendingChangesRef.current[taskId],
      [field]: value,
    };

    flushChanges();
  };

  const handleRemoveTask = useCallback(
    async (taskId: string) => {
      try {
        const res = await API.delete(`/task/delete/${taskId}`);
        if (res.status !== 200) {
          throw new Error("Failed to delete task");
        }
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    },
    [setTasks]
  );

  const handleAddTask = (status: Status) => {
    const newTask: Task = {
      id: `temp-${uuidv4()}`,
      title: "New Task",
      description: "",
      status,
      priority: Priority.MEDIUM,
      dueDate: filteredDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks((prev) => [newTask, ...prev]);

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
        setTasks((prev) =>
          prev.map((task) => (task.id === newTask.id ? savedTask : task))
        );
      } catch (error) {
        console.error("Failed to create task:", error);
        setTasks((prev) => prev.filter((task) => task.id !== newTask.id));
      }
    };

    addTask();
  };

  // Filter tasks based on selected date
  const displayTasks = filteredDate
    ? tasks.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate).toDateString() === filteredDate.toDateString()
      )
    : tasks;

  // Group tasks by status
  const todoTasks = displayTasks.filter((task) => task.status === Status.TODO);
  const inProgressTasksList = displayTasks.filter(
    (task) => task.status === Status.IN_PROGRESS
  );
  const doneTasks = displayTasks.filter((task) => task.status === Status.DONE);

  const TaskGroup = ({ title, tasks: groupTasks, icon: Icon, bgColor, borderColor, iconColor, titleColor, status }: {
    title: string;
    tasks: Task[];
    icon: React.ElementType;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
    status: Status;
  }) => {
    // Extract the color from the borderColor class
    const getColorFromBorderClass = (borderClass: string) => {
      switch (borderClass) {
        case 'border-orange-400':
          return '#fb923c'; // orange-400
        case 'border-blue-400':
          return '#60a5fa'; // blue-400
        case 'border-green-400':
          return '#4ade80'; // green-400
        default:
          return '#9ca3af'; // gray-400
      }
    };

    return (
      <div 
        className={`rounded-xl ${bgColor} border border-gray-300 p-5 mb-4 shadow-sm`}
        style={{
          borderLeft: `4px solid ${getColorFromBorderClass(borderColor)}`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${iconColor} bg-opacity-20`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className={`font-semibold ${titleColor} text-lg`}>{title}</h3>
          <p className="text-sm text-gray-500">{groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'}</p>
        </div>
      </div>
      <div className="space-y-1">
        {groupTasks.length > 0 && (
          groupTasks.map((task) => (
            <div key={task.id} className="bg-white p-2">
              <TaskItem
                task={task}
                onUpdateTask={handleUpdateTask}
                onRemoveTask={handleRemoveTask}
                isUpdating={updatingTasks.has(task.id)}
              />
            </div>
          ))
        )}
        
        {/* Add Task Button */}
        <button
          onClick={() => handleAddTask(status)}
          className="flex items-center gap-2 w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add task...</span>
        </button>
      </div>
    </div>
    );
  };

  return (
    <SectionCard 
      title={filteredDate ? `Tasks for ${filteredDate.toLocaleDateString()}` : "My Tasks"}
      className="relative"
    >
      {/* Task Overview Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{totalTasks}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Task Groups */}
      <div className="mt-6">
        <TaskGroup
          title="To Do"
          tasks={todoTasks}
          icon={AlertCircle}
          bgColor="bg-white"
          borderColor="border-orange-400"
          iconColor="text-orange-600"
          titleColor="text-orange-800"
          status={Status.TODO}
        />
        <TaskGroup
          title="In Progress"
          tasks={inProgressTasksList}
          icon={Clock}
          bgColor="bg-white"
          borderColor="border-blue-400"
          iconColor="text-blue-600"
          titleColor="text-blue-800"
          status={Status.IN_PROGRESS}
        />
        <TaskGroup
          title="Done"
          tasks={doneTasks}
          icon={CheckCircle}
          bgColor="bg-white"
          borderColor="border-green-400"
          iconColor="text-green-600"
          titleColor="text-green-800"
          status={Status.DONE}
        />
      </div>
    </SectionCard>
  );
};

export default UnifiedTaskPanel;
