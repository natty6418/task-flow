    
import API from './api';
import { AxiosError } from 'axios';
import {  ActivityLog, ActionType} from '@/types/type';



interface ErrorResponse {
  message: string;
}

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as ErrorResponse)?.message || 'Something went wrong';
};


export const fetchActivityLogsForProject = async (projectId: string): Promise<ActivityLog[]> => {
    try{
        const res = await API.get(`/activity/project/${projectId}`, {
            withCredentials: true,
        });
        return res.data.logs;
    }
    catch (err) {
        throw new Error(extractError(err));
    }
}

export const fetchActivityForTask = async (taskId: string): Promise<ActivityLog[]> => {
    try {
        const res = await API.get(`/activity/task/${taskId}`, {
            withCredentials: true,
        });
        return res.data.logs;
    } catch (err) {
        throw new Error(extractError(err));
    }
}

export const fetchUserActivity = async (userId: string): Promise<ActivityLog[]> => {
    try {
        const res = await API.get(`/activity/user/${userId}`, {
            withCredentials: true,
        });
        return res.data.logs;
    } catch (err) {
        throw new Error(extractError(err));
    }
}

export const fetchRecentActivity = async (limit: number = 10): Promise<ActivityLog[]> => {
    try {
        const res = await API.get('/activity/recent', {
            params: { limit },
            withCredentials: true,
        });
        return res.data.logs;
    } catch (err) {
        throw new Error(extractError(err));
    }
}