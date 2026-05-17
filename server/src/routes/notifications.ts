import { Router, Request, Response } from "express";
import { getDb } from "../db/init.js";
import { getVapidPublicKey } from "../services/push-service.js";

const router = Router();

// GET /api/notifications — 列表
router.get("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const unreadOnly = req.query.unread_only === "true";

  let sql = "SELECT n.*, a.name as asset_name FROM notifications n JOIN assets a ON n.asset_id = a.id";
  const params: unknown[] = [];

  if (unreadOnly) {
    sql += " WHERE n.is_read = 0 AND n.is_dismissed = 0";
  }

  sql += " ORDER BY n.trigger_date DESC";
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// PATCH /api/notifications/:id/read — 标记已读
router.patch("/:id/read", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json({ success: true });
});

// PATCH /api/notifications/:id/dismiss — 忽略
router.patch("/:id/dismiss", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = db.prepare("UPDATE notifications SET is_dismissed = 1 WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json({ success: true });
});

// POST /api/notifications/scan — 触发扫描
router.post("/scan", async (_req: Request, res: Response) => {
  const { scanNotifications } = await import("../services/notification-scanner.js");
  const count = await scanNotifications();
  res.json({ scanned: count });
});

export default router;
