import API from "./api";
import { AxiosError } from "axios";
import { Notification } from "@/types/type";

interface ErrorResponse {
  message: string;
}

const extractError = (err: unknown): string => {
  const axiosErr = err as AxiosError;
  return (axiosErr.response?.data as ErrorResponse)?.message || "Something went wrong";
};

// 🔹 Fetch all notifications for the authenticated user
const fetchNotifications = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  notifications: Notification[];
  pagination:{
    total: number;
    page: number;
    limit: number;
  }
}> => {
  try {
    const response = await API.get("/notification", { params });
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};


// 🔹 Mark a notification as read
const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await API.patch(`/notification/${notificationId}/read`);
  } catch (error) {
    throw new Error(extractError(error));
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await API.patch("/notification/read-all");
  } catch (error) {
    throw new Error(extractError(error));
  }
};

const pollNotifications = async (): Promise<{
  unreadCount: number;
  notifications: Notification[];
  lastChecked: Date;
}> => {
  try {
    const response = await API.get("/notification/poll");
    return {
      unreadCount: response.data.unreadCount,
      notifications: response.data.recentNotifications,
      lastChecked: new Date(),
    };
  } catch (error) {
    throw new Error(extractError(error));
  }
};

export { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, pollNotifications };
