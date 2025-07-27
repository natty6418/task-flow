import API from './api';
import { AxiosError } from 'axios';
import { User, UserProfile } from '@/types/type';

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as { message?: string })?.message || 'Something went wrong';
};


export const fetchCurrentUser = async (): Promise<User> => {
  try {
    const res = await API.get('/user/me');
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};


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


export const deleteUser = async (): Promise<{ message: string }> => {
  try {
    const res = await API.delete('/user/delete');
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const res = await API.get(`/user/profile/`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};

export const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const res = await API.patch('/user/profile/', data);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err));
  }
};
