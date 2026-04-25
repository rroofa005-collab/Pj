import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL environment variable is not set. Please set it in your Railway or environment variables.");
}

const pool = new Pool({ 
  connectionString,
  max: 1 
});

export const db = drizzle(pool, { schema });
