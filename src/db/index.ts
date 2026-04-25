import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import { mkdirSync, existsSync } from "fs";

let _db: BetterSQLite3Database<typeof schema> | null = null;

function getDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;

  const dbPath = process.env.DATABASE_URL || process.env.POSTGRES_URL || "./data/database.db";
  const resolvedPath = path.resolve(dbPath);

  const dir = path.dirname(resolvedPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  console.log("Connecting to database at:", resolvedPath);
  const sqlite = new Database(resolvedPath);
  _db = drizzle(sqlite, { schema });
  return _db;
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_, prop: string | symbol) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
