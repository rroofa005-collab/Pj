// Force SQLite - Block any pg auto-import
import path from "path";
import { mkdirSync, existsSync } from "fs";
import * as schema from "./schema";

// CRITICAL: Prevent Next.js from tree-shaking to node-postgres
(global as any).__NO_PG__ = true;

const Database = require("better-sqlite3");
const { drizzle: drizzleSQLite } = require("drizzle-orm/better-sqlite3");

const dbPath = process.env.DB_PATH || "./data/database.db";
const resolvedPath = path.resolve(dbPath);
const dir = path.dirname(resolvedPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const sqlite = new Database(resolvedPath);
export const db = drizzleSQLite(sqlite, { schema });
