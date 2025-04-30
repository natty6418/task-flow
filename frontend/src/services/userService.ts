import API from './api';
import { User } from '@/types/type';



// 🔹 Get the currently authenticated user and their data
export const fetchCurrentUser = async (): Promise<User> => {
  const res = await API.get('/user/me');
  return res.data;
};

// 🔹 Update current user's name and email
export const updateUser = async (data: {
  name: string;
  email: string;
}): Promise<User> => {
  const res = await API.post('/user/update', data);
  return res.data;
};

// 🔹 Delete the current user
export const deleteUser = async (): Promise<{ message: string }> => {
  const res = await API.delete('/user/delete');
  return res.data;
};
