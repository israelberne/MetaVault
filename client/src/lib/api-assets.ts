import { apiFetch } from "./api-client";
import type { Asset, AssetInput, AssetFilters } from "@/types/asset";

export function fetchAssets(filters?: AssetFilters): Promise<Asset[]> {
  const params = new URLSearchParams();
  if (filters?.asset_type) params.set("asset_type", filters.asset_type);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);

  const qs = params.toString();
  return apiFetch<Asset[]>(`/assets${qs ? `?${qs}` : ""}`);
}

export function fetchAsset(id: string): Promise<Asset> {
  return apiFetch<Asset>(`/assets/${id}`);
}

export function createAsset(input: AssetInput): Promise<Asset> {
  return apiFetch<Asset>("/assets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAsset(id: string, input: AssetInput): Promise<Asset> {
  return apiFetch<Asset>(`/assets/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteAsset(id: string): Promise<void> {
  return apiFetch(`/assets/${id}`, { method: "DELETE" });
}
