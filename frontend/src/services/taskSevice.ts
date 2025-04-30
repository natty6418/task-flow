import API from "./api";
import { Task, Priority, Status } from "@/types/type";


// Fetch all tasks assigned to the authenticated user
export const fetchAllTasks = async (): Promise<Task[]> => {
    const response = await API.get("/task/all");
    return response.data;
  };
  
  // Fetch all tasks for a given project
  export const fetchProjectTasks = async (projectId: string): Promise<Task[]> => {
    const response = await API.get("/task/project-tasks", {
      params: { projectId },
    });
    return response.data;
  };
  
  // Create a new task
  export const createTask = async (taskData: {
    title: string;
    description?: string;
    dueDate?: string; // ISO string
    status?: Status;
    boardId?: string;
  }): Promise<Task> => {
    const response = await API.post("/task/create", taskData);
    return response.data;
  };
  
  // Assign a task to a different user
  export const assignTask = async (taskId: string, userId: string): Promise<Task> => {
    const response = await API.post("/task/assign", { taskId, userId });
    return response.data;
  };
  
  // Update an existing task
  export const updateTask = async (taskData: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    status?: Status;
    priority?: Priority;
  }): Promise<Task> => {
    const response = await API.put("/task/update", taskData);
    return response.data;
  };
  
  // Delete a task by ID
  export const deleteTask = async (taskId: string): Promise<Task> => {
    const response = await API.delete(`/task/delete/${taskId}`);
    return response.data;
  };
