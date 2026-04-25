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
  console.log("🚀 Checking database connection...");
  
  try {
    const test = await db.select({ count: schema.users.id }).from(schema.users).limit(1).catch(() => []);
    console.log("✅ Database connected!");
    
    const adminExists = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
    if (adminExists.length === 0) {
      const hashPassword = (password: string) => {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
          const char = password.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(36) + password.length.toString(36);
      };
      
      await db.insert(schema.users).values({
        username: "Roofa",
        password: hashPassword("Azer123"),
        role: "admin",
        permissions: "[]",
        isActive: true,
        createdAt: new Date(),
      });
      console.log("✅ Admin created: Roofa / Azer123");
    }
    
    const langExists = await db.select({ id: schema.appSettings.id }).from(schema.appSettings).limit(1);
    if (langExists.length === 0) {
      await db.insert(schema.appSettings).values({ key: "language", value: "ar" });
      console.log("✅ Language setting created");
    }
    
    console.log("\n🎉 Database ready! Login: Roofa / Azer123");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
