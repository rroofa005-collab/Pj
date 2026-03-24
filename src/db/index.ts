import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbPath = process.env.DB_PATH || "./data/database.db";

// Ensure the directory exists
const dir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const client = createClient({
  url: `file:${path.resolve(dbPath)}`,
});

export const db = drizzle(client, { schema });
