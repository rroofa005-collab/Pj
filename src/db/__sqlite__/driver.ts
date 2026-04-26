// SQLite Driver Wrapper - Prevents pg auto-import
import Database from "better-sqlite3";

export function createSQLiteConnection(dbPath: string) {
  const sqlite = new Database(dbPath);
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  return drizzle(sqlite);
}
