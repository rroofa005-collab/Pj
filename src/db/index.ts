import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _client: postgres.Sql<{}> | null = null;

function getClient(): postgres.Sql<{}> {
  if (_client) return _client;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL or POSTGRES_URL environment variable is not set");
  }
  
  _client = postgres(connectionString, { max: 1 });
  return _client;
}

function getDb() {
  if (_db) return _db;
  
  const client = getClient();
  _db = drizzle(client, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop: string | symbol) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});