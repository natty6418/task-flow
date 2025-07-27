
import API from './api';
import { AxiosError } from 'axios';




interface ErrorResponse {
  message: string;
}

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as ErrorResponse)?.message || 'Something went wrong';
};


//login function
export const login = async (email: string, password: string): Promise<void> => {
    try {
        await API.post('/auth/login', { email, password }, { withCredentials: true });
    } catch (err) {
        throw new Error(extractError(err));
    }
}

export const signUp = async (name: string, email: string, password: string): Promise<void> => {
    try {
        await API.post('/auth/signup', { name, email, password }, { withCredentials: true });
    } catch (err) {
        throw new Error(extractError(err));
    }
}

//delete-account function
export const deleteAccount = async (): Promise<void> => {
    try {
        await API.delete('/auth/delete-account', { withCredentials: true });
    } catch (err) {
        throw new Error(extractError(err));
    }
}