import { apiFetch } from "./api-client";

export interface DashboardOverview {
  totalAssets: number;
  totalSuppliers: number;
  totalValue: number;
  byType: Array<{ type: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
}

export interface SubscriptionSummary {
  monthlyTotal: number;
  yearlyTotal: number;
  items: Array<{ id: string; name: string; amount: number; cycle: string; monthly: number }>;
}

export interface HealthOverview {
  unreadNotifications: number;
  expiringAssets: number;
  expiringDetails: Array<{ id: string; name: string; type: string; ext: unknown }>;
}

export function fetchDashboardOverview(): Promise<DashboardOverview> {
  return apiFetch<DashboardOverview>("/dashboard/overview");
}

export function fetchSubscriptionSummary(): Promise<SubscriptionSummary> {
  return apiFetch<SubscriptionSummary>("/dashboard/subscriptions");
}

export function fetchHealthOverview(): Promise<HealthOverview> {
  return apiFetch<HealthOverview>("/dashboard/health");
}
