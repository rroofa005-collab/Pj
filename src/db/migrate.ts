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

await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("✅ Migrations completed successfully");
