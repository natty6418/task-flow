
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

export const logout = async (): Promise<void> => {
    try {
        await API.post('/auth/logout', {}, { withCredentials: true });
    } catch (err) {
        throw new Error(extractError(err));
    }
}

//delete-account function
export const deleteAccount = async (password: string): Promise<void> => {
    try {
        await API.delete('/auth/delete-account', { 
            data: { password },
            withCredentials: true 
        });
    } catch (err) {
        throw new Error(extractError(err));
    }
}

// Exchange session for JWT token (for OAuth flow)
export const exchangeSessionForToken = async (tempToken?: string | null) => {
    try {
        const url = tempToken ? `/auth/token?token=${tempToken}` : '/auth/token';
        const response = await API.get(url, { withCredentials: true });
        return response.data;
    } catch (err) {
        throw new Error(extractError(err));
    }
}