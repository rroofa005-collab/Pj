import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { mkdirSync, existsSync } from "fs";

const dbPath = process.env.DB_PATH || "./data/database.db";
const resolvedPath = path.resolve(dbPath);

// Ensure the directory exists
const dir = path.dirname(resolvedPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(resolvedPath);
const db = drizzle(sqlite, { schema });

// Run Drizzle migrations (handles schema creation from scratch)
await migrate(db, { migrationsFolder: "./src/db/migrations" });

// ── Safety patches: add missing columns/tables if they don't exist ──
// This handles databases that existed before a migration was added.

const existingUserCols = sqlite
  .prepare("PRAGMA table_info(users)")
  .all() as { name: string }[];
const userColNames = existingUserCols.map((c) => c.name);

if (!userColNames.includes("worker_id")) {
  sqlite.exec("ALTER TABLE users ADD COLUMN worker_id INTEGER;");
  console.log("✅ Added worker_id column to users");
}

// Create attendance table if it doesn't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER,
    username TEXT,
    worker_id INTEGER,
    worker_name TEXT,
    check_in INTEGER,
    check_out INTEGER,
    work_hours REAL DEFAULT 0,
    date TEXT,
    note TEXT
  );
`);

console.log("✅ Migrations and patches completed successfully");
