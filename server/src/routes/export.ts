import { Router, Request, Response } from "express";
import { getDb } from "../db/init.js";
import * as xlsx from "xlsx";

const router = Router();

// GET /api/export/assets — 导出资产为 Excel
router.get("/assets", async (_req: Request, res: Response) => {
  const db = await getDb();
  const rows = db.prepare("SELECT * FROM assets ORDER BY updated_at DESC").all() as Record<string, unknown>[];

  const typeLabels: Record<string, string> = { physical: "物理资产", digital: "数字资产", subscription: "订阅" };
  const statusLabels: Record<string, string> = { active: "使用中", idle: "闲置", expired: "过期", disposed: "已处置" };

  const exportData = rows.map((row) => {
    const ext = JSON.parse(row.ext as string || "{}") as Record<string, unknown>;
    const sourceLabels: Record<string, string> = { purchase: "购入", self_build: "自建", donation: "捐赠", transfer: "调拨" };

    const base: Record<string, unknown> = {
      "资产名称": row.name,
      "资产类型": typeLabels[row.type as string] ?? row.type,
      "分类": row.category,
      "状态": statusLabels[row.status as string] ?? row.status,
      "标签": (JSON.parse(row.tags as string || "[]") as string[]).join(","),
      "获取日期": row.purchase_date,
      "获取价格": row.purchase_price,
      "币种": row.currency,
      "备注": row.notes,
      "创建时间": row.created_at,
      "更新时间": row.updated_at,
    };

    if (row.type === "physical") {
      base["规格型号"] = ext.model ?? "";
      base["数量"] = ext.quantity ?? "";
      base["计量单位"] = ext.unit ?? "";
      base["存放位置"] = ext.location ?? "";
      base["用途场景"] = ext.usage ?? "";
      base["归属人"] = ext.owner ?? "";
      base["资产来源"] = sourceLabels[ext.source as string] ?? ext.source ?? "";
      base["保修到期日"] = ext.warranty_expiry ?? "";
      base["序列号"] = ext.serial_number ?? "";
    } else if (row.type === "digital") {
      base["平台"] = ext.platform ?? "";
      base["账号"] = ext.account ?? "";
      base["到期日"] = ext.expiry_date ?? "";
    } else if (row.type === "subscription") {
      base["计费周期"] = ext.billing_cycle ?? "";
      base["每期费用"] = ext.amount ?? "";
      base["下次扣费日"] = ext.next_billing_date ?? "";
      base["试用到期日"] = ext.trial_end ?? "";
    }

    return base;
  });

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(exportData);
  xlsx.utils.book_append_sheet(wb, ws, "资产");

  const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=assets.xlsx");
  res.send(buf);
});

// GET /api/export/suppliers — 导出供应商为 Excel
router.get("/suppliers", async (_req: Request, res: Response) => {
  const db = await getDb();
  const rows = db.prepare("SELECT * FROM suppliers ORDER BY updated_at DESC").all() as Record<string, unknown>[];

  const typeLabels: Record<string, string> = { physical: "物理", digital: "数字", subscription: "订阅", mixed: "混合" };

  const exportData = rows.map((row) => ({
    "供应商名称": row.name,
    "类型": typeLabels[row.type as string] ?? row.type,
    "评分": row.rating,
    "标签": (JSON.parse(row.tags as string || "[]") as string[]).join(","),
    "联系方式": row.contact,
    "网址": row.website,
    "备注": row.notes,
    "是否收藏": row.is_favorite ? "是" : "否",
    "创建时间": row.created_at,
    "更新时间": row.updated_at,
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(exportData);
  xlsx.utils.book_append_sheet(wb, ws, "供应商");

  const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=suppliers.xlsx");
  res.send(buf);
});

export default router;