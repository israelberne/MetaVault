import { Router, Request, Response } from "express";
import { getDb } from "../db/init.js";

const router = Router();

// GET /api/suppliers — 列表
router.get("/", async (_req: Request, res: Response) => {
  const db = await getDb();
  const rows = db.prepare("SELECT * FROM suppliers ORDER BY updated_at DESC").all();
  res.json(rows.map((row: Record<string, unknown>) => ({
    ...row,
    tags: JSON.parse(row.tags as string || "[]"),
  })));
});

// GET /api/suppliers/:id — 详情
router.get("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const row = db.prepare("SELECT * FROM suppliers WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }
  res.json({ ...row, tags: JSON.parse(row.tags as string || "[]") });
});

// POST /api/suppliers — 创建
router.post("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const id = crypto.randomUUID();
  const { name, type, rating, tags, contact, website, notes, is_favorite } = req.body;
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO suppliers (id, name, type, rating, tags, contact, website, notes, is_favorite, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, type, rating ?? null, JSON.stringify(tags ?? []), contact ?? null, website ?? null, notes ?? null, is_favorite ? 1 : 0, now, now);

  const row = db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id) as Record<string, unknown>;
  res.status(201).json({ ...row, tags: JSON.parse(row.tags as string || "[]") });
});

// PUT /api/suppliers/:id — 更新
router.put("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const existing = db.prepare("SELECT id FROM suppliers WHERE id = ?").get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }

  const { name, type, rating, tags, contact, website, notes, is_favorite } = req.body;
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE suppliers SET name=?, type=?, rating=?, tags=?, contact=?, website=?, notes=?, is_favorite=?, updated_at=?
     WHERE id=?`
  ).run(name, type, rating ?? null, JSON.stringify(tags ?? []), contact ?? null, website ?? null, notes ?? null, is_favorite ? 1 : 0, now, req.params.id);

  const row = db.prepare("SELECT * FROM suppliers WHERE id = ?").get(req.params.id) as Record<string, unknown>;
  res.json({ ...row, tags: JSON.parse(row.tags as string || "[]") });
});

// PATCH /api/suppliers/:id/favorite — 切换收藏
router.patch("/:id/favorite", async (req: Request, res: Response) => {
  const db = await getDb();
  const row = db.prepare("SELECT is_favorite FROM suppliers WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }
  const newVal = row.is_favorite ? 0 : 1;
  db.prepare("UPDATE suppliers SET is_favorite = ?, updated_at = ? WHERE id = ?").run(newVal, new Date().toISOString(), req.params.id);
  res.json({ is_favorite: newVal });
});

// DELETE /api/suppliers/:id — 删除
router.delete("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.prepare("DELETE FROM suppliers WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
