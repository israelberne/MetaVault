import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export async function getDb(): Promise<Database.Database> {
  if (db) return db;

  const dbPath = join(__dirname, "../../data/metavault.db");
  await mkdir(dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const sql = readFileSync(join(__dirname, "init.sql"), "utf-8");
  db.exec(sql);

  return db;
}
