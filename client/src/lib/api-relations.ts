import { apiFetch } from "./api-client";

export interface Relation {
  id: string;
  source_id: string;
  target_id: string;
  relation: "depends_on" | "contains" | "bound_to" | "related_to";
  source_name: string;
  target_name: string;
  created_at: string;
}

export function fetchRelations(assetId: string): Promise<Relation[]> {
  return apiFetch<Relation[]>(`/relations/${assetId}`);
}

export function addRelation(sourceId: string, targetId: string, relation: string): Promise<Relation> {
  return apiFetch<Relation>("/relations", {
    method: "POST",
    body: JSON.stringify({ source_id: sourceId, target_id: targetId, relation }),
  });
}

export function removeRelation(id: string): Promise<void> {
  return apiFetch(`/relations/${id}`, { method: "DELETE" });
}
