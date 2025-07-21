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
const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await API.get("/notifications");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error));
  }
};


// 🔹 Mark a notification as read
const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await API.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    throw new Error(extractError(error));
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await API.patch("/notifications/read-all");
  } catch (error) {
    throw new Error(extractError(error));
  }
};
