import API from "./api";
import { AxiosError } from "axios";
import { Task, Status } from "@/types/type";
import { ensureBoardForStatus } from "@/utils/boardUtils";

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
export const createTask = async (taskData: Task): Promise<Task> => {
  try {
    // If projectId is provided and no boardId is set, try to find the appropriate board
    if (taskData.projectId && !taskData.boardId) {
      const targetBoardId = await ensureBoardForStatus(taskData.projectId, taskData.status);
      if (targetBoardId) {
        taskData = { ...taskData, boardId: targetBoardId };
      }
    }

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
export const updateTask = async (taskData: Task): Promise<Task> => {
  try {
    // If the task has a projectId and the status might have changed, 
    // ensure it's assigned to the correct board
    if (taskData.projectId && taskData.status) {
      const targetBoardId = await ensureBoardForStatus(taskData.projectId, taskData.status);
      if (targetBoardId && targetBoardId !== taskData.boardId) {
        taskData = { ...taskData, boardId: targetBoardId };
      }
    }

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

// 🔹 Move task to appropriate board based on status
export const moveTaskToBoard = async (taskId: string, status: Status, projectId: string): Promise<Task> => {
  try {
    // Fetch the current task
    const taskResponse = await API.get(`/task/${taskId}`);
    const currentTask = taskResponse.data;

    // Get the appropriate board for the status
    const targetBoardId = await ensureBoardForStatus(projectId, status);

    if (!targetBoardId) {
      throw new Error(`No board found for status: ${status}`);
    }

    // Update the task with new status and board
    const updatedTask = {
      ...currentTask,
      status,
      boardId: targetBoardId,
      updatedAt: new Date()
    };

    const response = await API.put("/task/update", updatedTask);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};
