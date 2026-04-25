import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./server-auth";
import { db } from "@/db";
import { eq, and, gte, lte, like, or } from "drizzle-orm/better-sqlite3";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

export async function requireSession(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

export { db, eq, and, gte, lte, like, or };
export type { SQLiteTable };
