import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRelations, addRelation, removeRelation } from "@/lib/api-relations";

export function useRelations(assetId: string) {
  return useQuery({
    queryKey: ["relations", assetId],
    queryFn: () => fetchRelations(assetId),
    enabled: !!assetId,
  });
}

export function useAddRelation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, targetId, relation }: { sourceId: string; targetId: string; relation: string }) =>
      addRelation(sourceId, targetId, relation),
    onSuccess: (_data, { sourceId }) => qc.invalidateQueries({ queryKey: ["relations", sourceId] }),
  });
}

export function useRemoveRelation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeRelation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["relations"] }),
  });
}