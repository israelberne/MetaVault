import type { testAsset, testSupplier, testSupplierDigital } from "./test-data.js";

const BASE = "http://localhost:3001/api";

export async function resetDb() {
  const res = await fetch(`${BASE}/test/reset`, { method: "POST" });
  if (!res.ok) throw new Error(`Reset failed: ${res.status}`);
}

export async function createAsset(
  data: Partial<typeof testAsset.physical> & { type: string; name: string }
) {
  const res = await fetch(`${BASE}/assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create asset failed: ${res.status}`);
  return res.json();
}

export async function createSupplier(
  data: Partial<typeof testSupplier> & { name: string }
) {
  const res = await fetch(`${BASE}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create supplier failed: ${res.status}`);
  return res.json();
}

export async function scanNotifications() {
  const res = await fetch(`${BASE}/notifications/scan`, { method: "POST" });
  if (!res.ok) throw new Error(`Scan failed: ${res.status}`);
  return res.json();
}
