"use client";

import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Task, Project } from "../types/type";
import API from "@/services/api";
import { useAuth } from "./AuthContext";

interface AppContextType {
  projects: Project[];
  loadingProjects: boolean;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  loadingTasks: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  refreshProjects: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const { user } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoadingProjects(false);
      return;
    }

    try {
      setLoadingProjects(true);
      const res = await API.get('/project/', { withCredentials: true });
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    try {
      setLoadingTasks(true);
      const res = await API.get('/task/all', { withCredentials: true });
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [user]);

  const refreshProjects = async () => {
    await fetchProjects();
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  // Fetch projects when user changes
  useEffect(() => {
    fetchProjects();
  }, [user, fetchProjects]);

  // Fetch tasks when user changes (not when projects change)
  useEffect(() => {
    fetchTasks();
  }, [user, fetchTasks]);

  return (
    <AppContext.Provider
      value={{
        projects,
        loadingProjects,
        setProjects,
        tasks,
        loadingTasks,
        setTasks,
        refreshProjects,
        refreshTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
