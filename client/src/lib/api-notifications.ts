import { apiFetch } from "./api-client";

export interface Notification {
  id: string;
  asset_id: string;
  asset_name: string;
  type: "warranty_expiry" | "subscription_renewal" | "digital_expiry" | "trial_expiry" | "usage_stagnation" | "deprecation";
  message: string;
  trigger_date: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export function fetchNotifications(unreadOnly = false): Promise<Notification[]> {
  return apiFetch<Notification[]>(`/notifications${unreadOnly ? "?unread_only=true" : ""}`);
}

export function markNotificationRead(id: string): Promise<void> {
  return apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

export function dismissNotification(id: string): Promise<void> {
  return apiFetch(`/notifications/${id}/dismiss`, { method: "PATCH" });
}

export function scanNotifications(): Promise<{ scanned: number }> {
  return apiFetch("/notifications/scan", { method: "POST" });
}
