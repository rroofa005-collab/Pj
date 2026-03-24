import path from "path";
import { mkdirSync, existsSync } from "fs";

// Always exit 0 so `next start` runs even if migrations fail
try {
  const dbPath = process.env.DB_PATH || "./data/database.db";
  const resolvedPath = path.resolve(dbPath);

  const dir = path.dirname(resolvedPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Dynamic require so bun/node can resolve better-sqlite3
  const Database = require("better-sqlite3");
  const sqlite = new Database(resolvedPath);

  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const schema = await import("./schema");

  const db = drizzle(sqlite, { schema: schema });

  // Run Drizzle migrations
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("✅ Drizzle migrations applied");
  } catch (e) {
    console.warn("⚠️  Drizzle migrate warning:", e);
  }

  // Safety patch: add worker_id to users if missing
  try {
    const cols = (sqlite.prepare("PRAGMA table_info(users)").all() as { name: string }[]).map((c: { name: string }) => c.name);
    if (!cols.includes("worker_id")) {
      sqlite.exec("ALTER TABLE users ADD COLUMN worker_id INTEGER;");
      console.log("✅ Patched: worker_id added");
    }
  } catch (e) {
    console.warn("⚠️  Patch worker_id:", e);
  }

  // Safety patch: create attendance table if missing
  try {
    sqlite.exec(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id INTEGER, username TEXT, worker_id INTEGER,
      worker_name TEXT, check_in INTEGER, check_out INTEGER,
      work_hours REAL DEFAULT 0, date TEXT, note TEXT
    );`);
    console.log("✅ attendance table ready");
  } catch (e) {
    console.warn("⚠️  Create attendance:", e);
  }

  sqlite.close();
  console.log("✅ DB init complete");
} catch (e) {
  console.error("❌ DB init failed (app will still start):", e);
}

process.exit(0);
