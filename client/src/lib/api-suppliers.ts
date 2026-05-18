import { apiFetch } from "./api-client";

export interface Supplier {
  id: string;
  name: string;
  type: "physical" | "digital" | "subscription" | "mixed";
  rating: number | null;
  tags: string[];
  contact: string | null;
  website: string | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  related_assets?: Array<{ id: string; name: string; type: string; category: string; status: string }>;
}

export interface SupplierInput {
  name: string;
  type: "physical" | "digital" | "subscription" | "mixed";
  rating?: number | null;
  tags?: string[];
  contact?: string | null;
  website?: string | null;
  notes?: string | null;
  is_favorite?: boolean;
}

export interface SupplierFilters {
  type?: string;
  favorite?: boolean;
}

export function fetchSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.favorite) params.set("favorite", "true");
  const qs = params.toString();
  return apiFetch<Supplier[]>(`/suppliers${qs ? `?${qs}` : ""}`);
}

export function fetchSupplier(id: string): Promise<Supplier> {
  return apiFetch<Supplier>(`/suppliers/${id}`);
}

export function createSupplier(input: SupplierInput): Promise<Supplier> {
  return apiFetch<Supplier>("/suppliers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSupplier(id: string, input: SupplierInput): Promise<Supplier> {
  return apiFetch<Supplier>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function toggleSupplierFavorite(id: string): Promise<{ is_favorite: boolean }> {
  return apiFetch(`/suppliers/${id}/favorite`, { method: "PATCH" });
}

export function deleteSupplier(id: string): Promise<void> {
  return apiFetch(`/suppliers/${id}`, { method: "DELETE" });
}
