import { NextRequest, NextResponse } from "next/server";
import { and, db, eq, gte, like, lte } from "@/lib/apiHelper";
import { receivedAmounts } from "@/db/schema";
import { getSession } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (search) conditions.push(like(receivedAmounts.nature, `%${search}%`));
  if (from) conditions.push(gte(receivedAmounts.createdAt, new Date(from)));
  if (to) conditions.push(lte(receivedAmounts.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(receivedAmounts).where(and(...conditions))
    : await db.select().from(receivedAmounts);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(receivedAmounts).values({
    nature: body.nature, amount: Number(body.amount) || 0, note: body.note,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(receivedAmounts).set({
    nature: body.nature, amount: Number(body.amount) || 0, note: body.note,
  }).where(eq(receivedAmounts.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(receivedAmounts).where(eq(receivedAmounts.id, Number(id)));
  return NextResponse.json({ success: true });
}
