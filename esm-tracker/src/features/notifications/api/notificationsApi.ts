import { apiClient } from "@/shared/lib/apiClient";
import type { Notification } from "../types";

export const notificationsApi = {
  getAll: (): Promise<Notification[]> =>
    apiClient.get("/notifications").then((r) => r.data),

  markRead: (id: string): Promise<void> =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: (): Promise<void> =>
    apiClient.patch("/notifications/read-all").then((r) => r.data),
};