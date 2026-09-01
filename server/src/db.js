import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dataDir, "reports.sqlite");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS fabrikasi_reports (
    id TEXT PRIMARY KEY,
    week TEXT NOT NULL,
    region TEXT NOT NULL,
    produksi INTEGER NOT NULL DEFAULT 0,
    pengiriman INTEGER NOT NULL DEFAULT 0,
    pelapor TEXT,
    catatan TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS instalasi_reports (
    id TEXT PRIMARY KEY,
    week TEXT NOT NULL,
    region TEXT NOT NULL,
    tiang INTEGER NOT NULL DEFAULT 0,
    pelapor TEXT,
    catatan TEXT,
    created_at TEXT NOT NULL
  );
`);
