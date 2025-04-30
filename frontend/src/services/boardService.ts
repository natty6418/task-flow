import API from './api';
import { Task } from '@/types/type';

export interface Board {
  id: string;
  name: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  tasks: Task[];
  projectId: string;
}

// 🔹 Fetch all boards and their tasks in a project (GET /board/all?projectId=...)
export const fetchBoardsByProject = async (projectId: string): Promise<Board[]> => {
  const res = await API.get('/board/all', {
    params: { projectId },
  });
  return res.data;
};

// 🔹 Create a new board in a project (POST /board/create)
export const createBoard = async (data: {
  name: string;
  projectId: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}): Promise<Board> => {
  const res = await API.post('/board/create', data);
  return res.data;
};

// 🔹 Update a board (PUT /board/update)
export const updateBoard = async (data: {
  id: string;
  name: string;
  projectId: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  tasks: { id: string }[]; // Only IDs are required to connect tasks
}): Promise<Board> => {
  const res = await API.put('/board/update', data);
  return res.data;
};
