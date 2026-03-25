import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (_pool) return _pool;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL or POSTGRES_URL environment variable is not set");
  }
  
  _pool = new pg.Pool({ connectionString });
  return _pool;
}

function getDb() {
  if (_db) return _db;
  
  const pool = getPool();
  _db = drizzle(pool, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop: string | symbol) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});