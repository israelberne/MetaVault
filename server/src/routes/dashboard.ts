import { Router, Request, Response } from "express";
import { getDb } from "../db/init.js";

const router = Router();

// GET /api/dashboard/overview — 总览统计
router.get("/overview", async (_req: Request, res: Response) => {
  const db = await getDb();

  const totalAssets = (db.prepare("SELECT COUNT(*) as count FROM assets").get() as Record<string, number>).count;
  const totalSuppliers = (db.prepare("SELECT COUNT(*) as count FROM suppliers").get() as Record<string, number>).count;
  const totalValue = (db.prepare("SELECT COALESCE(SUM(purchase_price), 0) as total FROM assets WHERE purchase_price IS NOT NULL").get() as Record<string, number>).total;

  const byType = db.prepare("SELECT type, COUNT(*) as count FROM assets GROUP BY type").all();
  const byStatus = db.prepare("SELECT status, COUNT(*) as count FROM assets GROUP BY status").all();

  res.json({ totalAssets, totalSuppliers, totalValue, byType, byStatus });
});

// GET /api/dashboard/subscriptions — 订阅费用
router.get("/subscriptions", async (_req: Request, res: Response) => {
  const db = await getDb();

  const subscriptions = db.prepare(
    `SELECT id, name, ext FROM assets WHERE type = 'subscription' AND status = 'active'`
  ).all();

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  const items = subscriptions.map((row: Record<string, unknown>) => {
    const ext = JSON.parse(row.ext as string || "{}") as Record<string, unknown>;
    const amount = Number(ext.amount ?? 0);
    const cycle = String(ext.billing_cycle ?? "monthly");

    let monthly = 0;
    if (cycle === "monthly") monthly = amount;
    else if (cycle === "yearly") monthly = amount / 12;
    else if (cycle === "lifetime") monthly = 0;

    monthlyTotal += monthly;
    yearlyTotal += monthly * 12;

    return { id: row.id, name: row.name, amount, cycle, monthly };
  });

  res.json({ monthlyTotal: Math.round(monthlyTotal * 100) / 100, yearlyTotal: Math.round(yearlyTotal * 100) / 100, items });
});

// GET /api/dashboard/health — 健康度
router.get("/health", async (_req: Request, res: Response) => {
  const db = await getDb();

  const unreadNotifications = (db.prepare("SELECT COUNT(*) as count FROM notifications WHERE is_read = 0 AND is_dismissed = 0").get() as Record<string, number>).count;
  const expiringAssets = db.prepare(
    `SELECT id, name, type, ext FROM assets WHERE status = 'active'`
  ).all().filter((row: Record<string, unknown>) => {
    const ext = JSON.parse(row.ext as string || "{}") as Record<string, unknown>;
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (row.type === "physical" && ext.warranty_expiry) {
      return new Date(ext.warranty_expiry as string) <= in30Days;
    }
    if (row.type === "subscription" && ext.next_billing_date) {
      return new Date(ext.next_billing_date as string) <= in30Days;
    }
    if (row.type === "digital" && ext.expiry_date) {
      return new Date(ext.expiry_date as string) <= in30Days;
    }
    return false;
  });

  res.json({ unreadNotifications, expiringAssets: expiringAssets.length, expiringDetails: expiringAssets });
});

// GET /api/dashboard/trends — 近12个月订阅费用趋势
router.get("/trends", async (_req: Request, res: Response) => {
  const db = await getDb();
  const months = Number(_req.query.months) || 12;

  // 取所有活跃订阅资产，在 JS 中计算月费用并按月聚合
  const subs = db.prepare(
    `SELECT ext, created_at FROM assets WHERE type = 'subscription' AND status = 'active'`
  ).all() as Record<string, unknown>[];

  const monthMap = new Map<string, number>();
  for (const row of subs) {
    const ext = JSON.parse(row.ext as string || "{}") as Record<string, unknown>;
    const amount = Number(ext.amount ?? 0);
    const cycle = String(ext.billing_cycle ?? "monthly");
    let monthly = 0;
    if (cycle === "monthly") monthly = amount;
    else if (cycle === "yearly") monthly = amount / 12;

    const month = (row.created_at as string).slice(0, 7);
    monthMap.set(month, (monthMap.get(month) ?? 0) + monthly);
  }

  const result = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-months)
    .map(([month, cost]) => ({ month, monthly_cost: Math.round(cost * 100) / 100 }));

  res.json(result);
});

export default router;
