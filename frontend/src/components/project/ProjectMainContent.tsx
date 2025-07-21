"use client";

import { useState } from "react";
import { Layout, CheckSquare } from "lucide-react";
import { Task, Board, Project } from "@/types/type";
import ProjectBoardsSection from "./ProjectBoardsSection";
import ProjectTasksSection from "./ProjectTasksSection";

interface ProjectMainContentProps {
  project: Project;
  boards: Board[];
  tasks: Task[];
  boardView: "list" | "kanban";
  setBoardView: (view: "list" | "kanban") => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  setShowAddBoardModal: (show: boolean) => void;
  handleAddTask: () => void;
  handleUpdateTask: (taskId: string, field: keyof Task, value: Task[keyof Task]) => void;
  handleRemoveTask: (taskId: string) => void;
  updatingTasks: Set<string>;
}

export default function ProjectMainContent({
  project,
  boards,
  tasks,
  boardView,
  setBoardView,
  setTasks,
  setBoards,
  setShowAddBoardModal,
  handleAddTask,
  handleUpdateTask,
  handleRemoveTask,
  updatingTasks,
}: ProjectMainContentProps) {
  const [activeTab, setActiveTab] = useState<"boards" | "tasks">("boards");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("boards")}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "boards"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Layout className="w-4 h-4" />
              Boards
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {boards.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "tasks"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Tasks
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {tasks.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "boards" ? (
          <ProjectBoardsSection
            boards={boards}
            tasks={tasks}
            project={project}
            boardView={boardView}
            setBoardView={setBoardView}
            setBoards={setBoards}
            setTasks={setTasks}
            setShowAddBoardModal={setShowAddBoardModal}
            handleAddTask={handleAddTask}
            handleUpdateTask={handleUpdateTask}
            handleRemoveTask={handleRemoveTask}
            updatingTasks={updatingTasks}
          />
        ) : (
          <ProjectTasksSection
            tasks={tasks}
            setTasks={setTasks}
            handleAddTask={handleAddTask}
            handleUpdateTask={handleUpdateTask}
            handleRemoveTask={handleRemoveTask}
            updatingTasks={updatingTasks}
          />
        )}
      </div>
    </div>
  );
}
