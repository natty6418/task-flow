"use client";

import { LayoutIcon, ListIcon } from "lucide-react";
import { Board, Task, Project } from "@/types/type";
import BoardsList from "../boards/BoardsList";
import KanbanBoard from "@/components/kanban/KanbanBoard";

interface ProjectBoardsSectionProps {
  project: Project;
  boards: Board[];
  tasks: Task[];
  boardView: "list" | "kanban";
  setBoardView: (view: "list" | "kanban") => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  setShowAddBoardModal: (show: boolean) => void;
}

export default function ProjectBoardsSection({
  project,
  boards,
  tasks,
  boardView,
  setBoardView,
  setTasks,
  setBoards,
  setShowAddBoardModal,
}: ProjectBoardsSectionProps) {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <LayoutIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Project Boards</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {boards.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBoardView("list")}
            className={`p-2 rounded-lg transition-colors ${
              boardView === "list" 
                ? "bg-blue-100 text-blue-600" 
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="List view"
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setBoardView("kanban")}
            className={`p-2 rounded-lg transition-colors ${
              boardView === "kanban" 
                ? "bg-blue-100 text-blue-600" 
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Kanban view"
          >
            <LayoutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {boardView === "list" ? (
        <div className="p-4">
          <BoardsList
            boards={boards}
            tasks={tasks}
            projectId={project.id}
            setTasks={setTasks}
            setBoards={setBoards}
            setShowAddBoardModal={setShowAddBoardModal}
          />
        </div>
      ) : (
        <div className="">
          {boards.length > 0 ? (
            <div className="relative">
              <KanbanBoard
                setTasks={setTasks}
                setBoards={setBoards}
                projectId={project.id}
                boards={boards}
                tasks={tasks}
                onAddBoard={() => setShowAddBoardModal(true)}
                project={project}
              />
              {/* Add Board Button */}
              {/* <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setShowAddBoardModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Board
                </button>
              </div> */}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start with your first board</h3>
                <p className="text-gray-500 mb-6">
                  Organize your tasks with kanban boards. Create columns like &quot;To Do&quot;, &quot;In Progress&quot;, and &quot;Done&quot; to track your workflow.
                </p>
                <button
                  onClick={() => setShowAddBoardModal(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Create your first board
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
