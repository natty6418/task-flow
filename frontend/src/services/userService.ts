import API from './api';
import { AxiosError } from 'axios';
import { User } from '@/types/type';

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as { message?: string })?.message || 'Something went wrong';
};

// 🔹 Get the currently authenticated user and their data
export const fetchCurrentUser = async (): Promise<User> => {
  try {
    const res = await API.get('/user/me');
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Update current user's name and email
export const updateUser = async (data: {
  name: string;
  email: string;
}): Promise<User> => {
  try {
    const res = await API.post('/user/update', data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// 🔹 Delete the current user
export const deleteUser = async (): Promise<{ message: string }> => {
  try {
    const res = await API.delete('/user/delete');
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};
