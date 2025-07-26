    
import API from './api';
import { AxiosError } from 'axios';
import {  ActivityLog, ActionType, ActivityLogDiffResponse} from '@/types/type';



interface ErrorResponse {
  message: string;
}

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as ErrorResponse)?.message || 'Something went wrong';
};


export const fetchActivityLogsForProject = async (projectId: string, limit?: number, offset?: number): Promise<ActivityLog[]> => {
    try{
        const res = await API.get(`/activity/project/${projectId}`, {
            withCredentials: true,
            params: { limit, offset }
        });
        return res.data.logs;
    }
    catch (err) {
        throw new Error(extractError(err));
    }
}

export const fetchActivityForTask = async (taskId: string, limit?: number, offset?: number): Promise<ActivityLog[]> => {
    try {
        const res = await API.get(`/activity/task/${taskId}`, {
            withCredentials: true,
            params: { limit, offset }
        });
        return res.data.logs;
    } catch (err) {
        throw new Error(extractError(err));
    }
}

export const fetchUserActivity = async (userId: string, limit?: number, offset?: number): Promise<ActivityLog[]> => {
    try {
        const res = await API.get(`/activity/user/${userId}`, {
            withCredentials: true,
            params: { limit, offset }
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

export const fetchLogDiff = async (logId: string): Promise<
ActivityLogDiffResponse
> => {
    try {
        const res = await API.get(`/activity/diff/${logId}`, {
            withCredentials: true,
        });
        return res.data ;
    } catch (err) {
        throw new Error(extractError(err));
    }
}