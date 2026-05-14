import { apiFetch } from "./api-client";

export interface ImportPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  filePath: string;
}

export interface ImportResult {
  imported: number;
  errors: number;
  total: number;
}

export function parseImportFile(file: File): Promise<ImportPreview> {
  const formData = new FormData();
  formData.append("file", file);

  return fetch("/api/import/parse", {
    method: "POST",
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
  });
}

export function executeImport(filePath: string, mapping: Record<string, string>): Promise<ImportResult> {
  return apiFetch<ImportResult>("/import/execute", {
    method: "POST",
    body: JSON.stringify({ filePath, mapping }),
  });
}
