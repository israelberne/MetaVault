import { Router, Request, Response } from "express";
import type { Router as RouterType } from "express";
import { getDb } from "../db/init.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as xlsx from "xlsx";

const upload = multer({ dest: "uploads/" });

const router: RouterType = Router();

// POST /api/import/parse — 上传+解析预览
router.post("/parse", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const filePath = req.file.path;
  const ext = req.file.originalname.split(".").pop()?.toLowerCase();

  let rows: Record<string, unknown>[] = [];

  if (ext === "csv") {
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = xlsx.utils.sheet_to_json(ws);
  } else if (ext === "xlsx" || ext === "xls") {
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = xlsx.utils.sheet_to_json(ws);
  } else {
    res.status(400).json({ error: "Unsupported file format. Use .csv, .xlsx, or .xls" });
    return;
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  res.json({ columns, rows: rows.slice(0, 10), totalRows: rows.length, filePath });
});

// POST /api/import/execute — 确认导入
router.post("/execute", async (req: Request, res: Response) => {
  const db = await getDb();
  const { filePath, mapping } = req.body as { filePath: string; mapping: Record<string, string> };

  if (!filePath || !mapping) {
    res.status(400).json({ error: "filePath and mapping are required" });
    return;
  }

  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws);

  const insert = db.prepare(
    `INSERT INTO assets (id, name, type, category, status, tags, purchase_date, purchase_price, currency, notes, ext, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let imported = 0;
  let errors = 0;
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    for (const row of rows) {
      try {
        const name = String(row[mapping.name] ?? "");
        if (!name) { errors++; continue; }

        const type = String(row[mapping.type] ?? "physical");
        const category = String(row[mapping.category] ?? type);
        const status = String(row[mapping.status] ?? "active");
        const purchase_date = row[mapping.purchase_date] ? String(row[mapping.purchase_date]) : null;
        const purchase_price = row[mapping.purchase_price] ? Number(row[mapping.purchase_price]) : null;
        const notes = row[mapping.notes] ? String(row[mapping.notes]) : null;

        insert.run(
          crypto.randomUUID(), name, type, category, status,
          "[]", purchase_date, purchase_price, "CNY", notes, "{}", now, now
        );
        imported++;
      } catch {
        errors++;
      }
    }
  });

  transaction();
  res.json({ imported, errors, total: rows.length });
});

export default router;
