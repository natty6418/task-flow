"use client";

import { useState, useEffect } from "react";
import NewTaskModal from "./NewTaskModal";
import { Project } from "@/types/type";
import { useDebounce } from "use-debounce";
import API from "@/services/api";
import toast from "react-hot-toast";
import AddMemberModal from "@/components/AddMemberModal";
import AddBoardModal from "./AddBoardModal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {updateProject as updateProjectService} from "@/services/projectService";
import { Role } from "@/types/type";
import FloatingActionButton from "./FloatingActionButton";
import { Task, Status, Priority } from "@/types/type";
import { v4 as uuidv4 } from "uuid";
import ProjectHeader from "./project/ProjectHeader";
import ProjectMainContent from "./project/ProjectMainContent";
import ProjectStatsPanel from "./project/ProjectStatsPanel";
import ProjectMembersPanel from "./project/ProjectMembersPanel";
import ProjectRecentTasksPanel from "./project/ProjectRecentTasksPanel";

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
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [debouncedName] = useDebounce(name, 2000);
  const [debouncedDescription] = useDebounce(description, 2000);
  const [menuOpen, setMenuOpen] = useState(false);
  const { setProjects, user } = useAuth();
  const router = useRouter();

  const isAdmin = members.some((m) => m.user.id === user?.id && m.role === Role.ADMIN);

  const handleRemoveMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      setRemovingId(id);
      await API.post(`/project/removeMember/${project.id}`, { memberId: id }, { withCredentials: true });
      setMembers((prev) => prev.filter((m) => m.user.id !== id));
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

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
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to remove project");
      console.error("Failed to remove project:", error);
    }
  };

  const confirmLeave = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this project?"
    );
    if (confirmed) {
      handleRemoveProject(project.id);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 py-6">
        {/* Project Header */}
        <ProjectHeader
          name={name}
          description={description}
          project={project}
          setName={setName}
          setDescription={setDescription}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          confirmLeave={confirmLeave}
        />

        {/* Floating Action Button */}
        <FloatingActionButton
          setShowAddBoardModal={setShowAddBoardModal}
          setShowTaskModal={setShowTaskModal}
          setShowAddMemberModal={setShowAddMemberModal}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3">
            <ProjectMainContent
              project={project}
              boards={boards}
              tasks={tasks}
              boardView={boardView}
              setBoardView={setBoardView}
              setTasks={setTasks}
              setBoards={setBoards}
              setShowAddBoardModal={setShowAddBoardModal}
              handleAddTask={handleAddTask}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Project Stats Panel */}
            <ProjectStatsPanel
              tasks={tasks}
              members={members}
              boards={boards}
            />

            {/* Team Members Panel */}
            <ProjectMembersPanel
              members={members}
              isAdmin={isAdmin}
              user={user}
              setShowAddMemberModal={setShowAddMemberModal}
              handleRemoveMember={handleRemoveMember}
              removingId={removingId}
            />

            {/* Recent Tasks Panel */}
            <ProjectRecentTasksPanel
              tasks={tasks}
              setShowTaskModal={setShowTaskModal}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
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
          onClose={() => setShowAddMemberModal(false)}
        />
      )}
      {showAddBoardModal && (
        <AddBoardModal
          projectId={project.id}
          setBoards={setBoards}
          onClose={() => setShowAddBoardModal(false)}
        />
      )}
    </div>
  );
}
