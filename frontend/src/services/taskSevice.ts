import API from "./api";
import { AxiosError } from "axios";
import { Task, Priority, Status } from "@/types/type";

interface ErrorResponse {
  message: string;
}

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as ErrorResponse)?.message || "Something went wrong";
};

// 🔹 Fetch all tasks assigned to the authenticated user
export const fetchAllTasks = async (): Promise<Task[]> => {
  try {
    const response = await API.get("/task/all");
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Fetch all tasks for a given project
export const fetchProjectTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const response = await API.get("/task/project-tasks", {
      params: { projectId },
    });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Create a new task
export const createTask = async (taskData: {
  title: string;
  description?: string;
  dueDate?: string;
  status?: Status;
  boardId?: string;
}): Promise<Task> => {
  try {
    const response = await API.post("/task/create", taskData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Assign a task to a different user
export const assignTask = async (taskId: string, userId: string): Promise<Task> => {
  try {
    const response = await API.post("/task/assign", { taskId, userId });
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Update an existing task
export const updateTask = async (taskData: {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status?: Status;
  priority?: Priority;
}): Promise<Task> => {
  try {
    const response = await API.put("/task/update", taskData);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Delete a task by ID
export const deleteTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await API.delete(`/task/delete/${taskId}`);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};
