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

// 1. Run Drizzle migrations
try {
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("✅ Drizzle migrations applied");
} catch (e) {
  console.warn("⚠️  Drizzle migrate error (may be safe to ignore):", e);
}

// 2. Safety patches — ensure all columns/tables exist regardless of migration state
try {
  // Add worker_id to users if missing
  const userCols = (sqlite.prepare("PRAGMA table_info(users)").all() as { name: string }[]).map(c => c.name);
  if (!userCols.includes("worker_id")) {
    sqlite.exec("ALTER TABLE users ADD COLUMN worker_id INTEGER;");
    console.log("✅ Patched: added worker_id to users");
  }
} catch (e) {
  console.warn("⚠️  Patch worker_id error:", e);
}

try {
  // Create attendance table if missing
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id       INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id  INTEGER,
      username TEXT,
      worker_id INTEGER,
      worker_name TEXT,
      check_in  INTEGER,
      check_out INTEGER,
      work_hours REAL DEFAULT 0,
      date TEXT,
      note TEXT
    );
  `);
  console.log("✅ attendance table ready");
} catch (e) {
  console.warn("⚠️  Create attendance table error:", e);
}

console.log("✅ DB init complete");
