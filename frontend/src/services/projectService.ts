import API from './api';
import { AxiosError } from 'axios';
import { Project, Task, User, Status, Priority } from '@/types/type';

interface ApiErrorResponse {
  message?: string;
}

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as ApiErrorResponse)?.message || 'Something went wrong';
};

// Create a new project
export const createProject = async (data: {
  name: string;
  description?: string;
}): Promise<Project> => {
  try {
    const res = await API.post('/project/create', data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Get all projects owned by the user
export const fetchAllProjects = async (): Promise<Project[]> => {
  try {
    const res = await API.get('/project/');
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Search projects user is a member or owner of
export const searchProjects = async (search: string): Promise<Project[]> => {
  try {
    const res = await API.get('/project/search', {
      params: { search }
    });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Add a task to a project
export const addTaskToProject = async (data: {
  title: string;
  projectId: string;
  description?: string;
  dueDate?: string;
  status?: Status;
  priority?: Priority;
  boardId?: string;
}): Promise<Task> => {
  try {
    const res = await API.post('/project/addTask', data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Add a member to a project
export const addMemberToProject = async (
  projectId: string,
  memberData: { email: string; role: 'MEMBER' | 'ADMIN' }
): Promise<{ user: Pick<User, 'id' | 'name' | 'email'>; role: string }> => {
  try {
    const res = await API.post(`/project/addMember/${projectId}`, memberData);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Remove a member from a project
export const removeMemberFromProject = async (
  projectId: string,
  memberId: string
): Promise<{ message: string }> => {
  try {
    const res = await API.post(`/project/removeMember/${projectId}`, { memberId });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Fetch a single project with full details
export const fetchProjectById = async (projectId: string): Promise<Project> => {
  try {
    const res = await API.get(`/project/${projectId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Update a project
export const updateProject = async (
  projectId: string,
  updateData: { name?: string; description?: string }
): Promise<Project> => {
  try {
    const res = await API.put(`/project/${projectId}`, updateData);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<{ message: string }> => {
  try {
    const res = await API.delete(`/project/${projectId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};
