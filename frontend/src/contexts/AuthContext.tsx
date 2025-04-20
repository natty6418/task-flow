"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Task, User } from "../types/type";
import API from "@/services/api";
import { Project } from "@/types/type"; // Adjust the import path as necessary

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
  projects: Project[] | [];
  loadingProjects: boolean;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[] | [];
  loadingTasks: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const AuthContext = createContext<AuthContextType|null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
    setLoading(false);
    router.push('/'); // Redirect to the dashboard or home page
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  useEffect(()=>{
    const fetchProjects = async () => {
      try {
        const res = await API.get('/project/', { withCredentials: true });
        setProjects(res.data);
        setLoadingProjects(false);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    if (user) {
      fetchProjects();
    }
    // fetchProjects();
  }, [user]);

  useEffect(()=>{
    const fetchTasks = async () => {
      try {
        const res = await API.get('/task/all', { withCredentials: true });
        setTasks(res.data);
        setLoadingTasks(false);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };
    if (user) {
      fetchTasks();
    }
  }, [projects, user]);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get('/user/me', { withCredentials: true }); 
        if (res.status === 200) {
          setUser(res.data);
          setLoading(false);
        } else {
          router.push('/login'); 
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push('/login'); 
      }
    };

    checkAuth();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, projects, loadingProjects, setProjects, tasks, loadingTasks, setTasks }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};