import API from './api';
import { AxiosError } from 'axios';
import {  Board, Task } from '@/types/type';



interface ErrorResponse {
  message: string;
}

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as ErrorResponse)?.message || 'Something went wrong';
};

// 🔹 Fetch all boards and their tasks in a project
export const fetchBoardsByProject = async (projectId: string): Promise<Board[]> => {
  try {
    const res = await API.get('/board/all', {
      params: { projectId },
    });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Create a new board in a project
export const createBoard = async (data: {
  name: string;
  projectId: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}): Promise<Board> => {
  try {
    const res = await API.post('/board/create', data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Update a board
export const updateBoard = async (data: Board): Promise<Board> => {
  try {
    const res = await API.put('/board/update', data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  try {
    await API.delete(`/board/delete/${boardId}`);
  } catch (err) {
    throw new Error(extractError(err));
  }
};
