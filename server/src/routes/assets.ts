import { Router, Request, Response } from "express";
import { getDb } from "../db/init.js";

const router = Router();

// GET /api/assets — 列表（支持筛选）
router.get("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const { asset_type, status, category, search } = req.query;

  let sql = "SELECT * FROM assets WHERE 1=1";
  const params: unknown[] = [];

  if (asset_type) {
    sql += " AND type = ?";
    params.push(asset_type);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (search) {
    sql += " AND (name LIKE ? OR notes LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY updated_at DESC";

  const rows = db.prepare(sql).all(...params);
  // 解析 JSON 字段
  const assets = rows.map((row: Record<string, unknown>) => ({
    ...row,
    tags: JSON.parse(row.tags as string || "[]"),
    ext: JSON.parse(row.ext as string || "{}"),
  }));

  res.json(assets);
});

// GET /api/assets/:id — 详情
router.get("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const row = db.prepare("SELECT * FROM assets WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;

  if (!row) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  res.json({
    ...row,
    tags: JSON.parse(row.tags as string || "[]"),
    ext: JSON.parse(row.ext as string || "{}"),
  });
});

// POST /api/assets — 创建
router.post("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const id = crypto.randomUUID();
  const { name, type, category, status, tags, purchase_date, purchase_price, currency, supplier_id, notes, ext } = req.body;

  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO assets (id, name, type, category, status, tags, purchase_date, purchase_price, currency, supplier_id, notes, ext, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, name, type, category, status || "active",
    JSON.stringify(tags ?? []), purchase_date ?? null, purchase_price ?? null,
    currency || "CNY", supplier_id ?? null, notes ?? null,
    JSON.stringify(ext ?? {}), now, now
  );

  const row = db.prepare("SELECT * FROM assets WHERE id = ?").get(id) as Record<string, unknown>;
  res.status(201).json({
    ...row,
    tags: JSON.parse(row.tags as string || "[]"),
    ext: JSON.parse(row.ext as string || "{}"),
  });
});

// PUT /api/assets/:id — 更新
router.put("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const existing = db.prepare("SELECT id FROM assets WHERE id = ?").get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  const { name, type, category, status, tags, purchase_date, purchase_price, currency, supplier_id, notes, ext } = req.body;
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE assets SET name=?, type=?, category=?, status=?, tags=?, purchase_date=?, purchase_price=?, currency=?, supplier_id=?, notes=?, ext=?, updated_at=?
     WHERE id=?`
  ).run(
    name, type, category, status || "active",
    JSON.stringify(tags ?? []), purchase_date ?? null, purchase_price ?? null,
    currency || "CNY", supplier_id ?? null, notes ?? null,
    JSON.stringify(ext ?? {}), now, req.params.id
  );

  const row = db.prepare("SELECT * FROM assets WHERE id = ?").get(req.params.id) as Record<string, unknown>;
  res.json({
    ...row,
    tags: JSON.parse(row.tags as string || "[]"),
    ext: JSON.parse(row.ext as string || "{}"),
  });
});

// DELETE /api/assets/:id — 删除
router.delete("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.prepare("DELETE FROM assets WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
