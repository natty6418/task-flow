"use client";

import { useState, useEffect } from "react";
import TasksList from "@/components/TaskList";
import BoardsList from "@/components/BoardsList";
import MembersList from "@/components/MembersList";
import NewTaskModal from "./NewTaskModal";

import { Project } from "@/types/type";
import { useDebounce } from "use-debounce";
import API from "@/services/api";
import toast from "react-hot-toast";
import AddMemberModal from "@/components/AddMemberModal";
import AddBoardModal from "./AddBoardModal";
import FloatingActionButton from "./FloatingActionButton";
import { MoreVertical, ListIcon, LayoutIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import {updateProject as updateProjectService} from "@/services/projectService";

export default function ProjectDetails({ project }: { project: Project }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [members, setMembers] = useState(project.projectMemberships);
  const [boards, setBoards] = useState(project.boards);
  const [tasks, setTasks] = useState(project.tasks);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [boardView, setBoardView] = useState<"list" | "kanban">("kanban");

  const [debouncedName] = useDebounce(name, 2000);
  const [debouncedDescription] = useDebounce(description, 2000);
  const [menuOpen, setMenuOpen] = useState(false);
  const { setProjects } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const updateProject = async () => {
      try {
        await updateProjectService(project.id, {
          name: debouncedName,
          description: debouncedDescription,
        })
          setName(debouncedName);
          setDescription(debouncedDescription);
          toast.success("Project updated successfully");
      } catch (error) {
        toast.error("Failed to update project");
        console.error("Failed to update project:", error);
      }
    };

    if (
      debouncedName !== project.name ||
      debouncedDescription !== project.description
    ) {
      updateProject();
    }
  }, [
    debouncedName,
    debouncedDescription,
    project.id,
    project.name,
    project.description,
  ]);

  const handleRemoveProject = async (projectId: string) => {
    try {
      const response = await API.delete(`/project/${projectId}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        toast.success("Project removed successfully");
        setProjects((prevProjects) =>
          prevProjects.filter((proj) => proj.id !== projectId)
        );

        // Optionally, you can redirect or update the UI after successful deletion
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to remove project");
      console.error("Failed to remove project:", error);
    }
  };
  // Confirm before leaving the project

  const confirmLeave = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this project?"
    );
    if (confirmed) {
      handleRemoveProject(project.id);
    }
  };

  const EditableHeader = () => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm relative">
        {/* Dropdown Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10">
              <button
                onClick={confirmLeave}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Leave Project
              </button>
            </div>
          )}
        </div>

        {/* Editable Header */}
        <div className="flex flex-col items-center mb-4">
          <h1
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setName(e.target.innerText)}
            className="text-3xl font-bold focus:outline-none"
          >
            {name}
          </h1>

          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setDescription(e.target.innerText)}
            className="text-gray-600 focus:outline-none"
          >
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{project.members.length} members</span>
            <span>{project.tasks.length} tasks</span>
            <span>{project.boards.length} boards</span>
          </div>
          <p className="text-sm text-gray-500">
            Created on {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Editable Header */}
      <EditableHeader />

      {/* Horizontal Layout */}
      <div className="flex flex-col  gap-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Boards</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setBoardView("list")}
              className={`p-2 rounded ${
                boardView === "list" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setBoardView("kanban")}
              className={`p-2 rounded ${
                boardView === "kanban" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <LayoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          {boardView === "list" ? (
            <BoardsList
              boards={boards}
              tasks={tasks}
              projectId={project.id}
              setTasks={setTasks}
              setBoards={setBoards}
              setShowAddBoardModal={setShowAddBoardModal}
            />
          ) : (
            <KanbanBoard
              setTasks={setTasks}
              boards={boards}
              tasks={tasks}
            />
          )}
        </div>

      </div>
        <TasksList
          tasks={tasks}
          setShowAddTaskModal={setShowTaskModal}
          setTasks={setTasks}
        />
        <MembersList
          members={members}
          setMembers={setMembers}
          setShowAddMemberModal={setShowAddMemberModal}
          projectId={project.id}
        />

      {/* New Task Button */}
      <FloatingActionButton
        setShowAddBoardModal={setShowAddBoardModal}
        setShowAddMemberModal={setShowAddMemberModal}
        setShowTaskModal={setShowTaskModal}
      />

      {/* New Task Modal */}
      {showTaskModal && (
        <NewTaskModal
          projectId={project.id}
          onClose={() => setShowTaskModal(false)}
          setTasks={setTasks}
        />
      )}
      {showAddMemberModal && (
        <AddMemberModal
          projectId={project.id}
          setMembers={setMembers}
          onClose={() => {
            setShowAddMemberModal(false);
          }}
        />
      )}
      {showAddBoardModal && (
        <AddBoardModal
          projectId={project.id}
          setBoards={setBoards}
          onClose={() => {
            setShowAddBoardModal(false);
          }}
        />
      )}
    </div>
  );
}
