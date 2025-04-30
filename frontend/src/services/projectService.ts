import API from './api';
import { Project, Task, User, Status, Priority } from '@/types/type'; // Adjust if needed

// Create a new project
export const createProject = async (data: {
  name: string;
  description?: string;
}): Promise<Project> => {
  const res = await API.post('/project/create', data);
  return res.data;
};

// Get all projects owned by the user
export const fetchAllProjects = async (): Promise<Project[]> => {
  const res = await API.get('/project/');
  return res.data;
};

// Search projects user is a member or owner of
export const searchProjects = async (search: string): Promise<Project[]> => {
  const res = await API.get('/project/search', {
    params: { search }
  });
  return res.data;
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
  const res = await API.post('/project/addTask', data);
  return res.data;
};

// Add a member to a project
export const addMemberToProject = async (
  projectId: string,
  memberData: { email: string; role: 'MEMBER' | 'ADMIN' }
): Promise<{ user: Pick<User, 'id' | 'name' | 'email'>; role: string }> => {
  const res = await API.post(`/project/addMember/${projectId}`, memberData);
  return res.data;
};

// Remove a member from a project
export const removeMemberFromProject = async (
  projectId: string,
  memberId: string
): Promise<{ message: string }> => {
  const res = await API.post(`/project/removeMember/${projectId}`, { memberId });
  return res.data;
};

// Fetch a single project with full details
export const fetchProjectById = async (projectId: string): Promise<Project> => {
  const res = await API.get(`/project/${projectId}`);
  return res.data;
};

// Update a project
export const updateProject = async (
  projectId: string,
  updateData: { name?: string; description?: string }
): Promise<Project> => {
  const res = await API.put(`/project/${projectId}`, updateData);
  return res.data;
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<{ message: string }> => {
  const res = await API.delete(`/project/${projectId}`);
  return res.data;
};
