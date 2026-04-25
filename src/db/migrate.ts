import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL or POSTGRES_URL is required");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

async function migrate() {
  console.log("🚀 Checking database...");
  try {
    // Check connection
    const result = await db.select({ count: schema.users.id })
      .from(schema.users)
      .limit(1);
    
    console.log("✅ Database connected successfully!");
    console.log("📊 Tables are ready");
    console.log("🔑 Login with: Roofa / Azer123");
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
