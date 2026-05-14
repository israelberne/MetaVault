import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAssets, fetchAsset, createAsset, updateAsset, deleteAsset } from "@/lib/api-assets";
import type { AssetInput, AssetFilters } from "@/types/asset";

export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: ["assets", filters],
    queryFn: () => fetchAssets(filters),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => fetchAsset(id),
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssetInput) => createAsset(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssetInput }) => updateAsset(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["assets", id] });
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}