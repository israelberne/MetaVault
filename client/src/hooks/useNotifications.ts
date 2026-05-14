import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationRead, dismissNotification, scanNotifications } from "@/lib/api-notifications";

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: () => fetchNotifications(unreadOnly),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDismiss() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useScanNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scanNotifications,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}