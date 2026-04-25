import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { expenses } from "@/db/schema";
import { getSession } from "@/lib/server-auth";
import { gte, lte, and, like } from "drizzle-orm/better-sqlite3";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (search) conditions.push(like(expenses.type, `%${search}%`));
  if (from) conditions.push(gte(expenses.createdAt, new Date(from)));
  if (to) conditions.push(lte(expenses.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(expenses).where(and(...conditions))
    : await db.select().from(expenses);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(expenses).values({
    type: body.type, amount: Number(body.amount) || 0, note: body.note,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(expenses).set({
    type: body.type, amount: Number(body.amount) || 0, note: body.note,
  }).where(eq(expenses.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(expenses).where(eq(expenses.id, Number(id)));
  return NextResponse.json({ success: true });
}
