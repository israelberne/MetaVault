import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview, fetchSubscriptionSummary, fetchHealthOverview } from "@/lib/api-dashboard";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
  });
}

export function useSubscriptionSummary() {
  return useQuery({
    queryKey: ["dashboard", "subscriptions"],
    queryFn: fetchSubscriptionSummary,
  });
}

export function useHealthOverview() {
  return useQuery({
    queryKey: ["dashboard", "health"],
    queryFn: fetchHealthOverview,
  });
}