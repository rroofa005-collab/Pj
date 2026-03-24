import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { deliveryTracking } from "@/db/schema";
import { getSession } from "@/lib/server-auth";
import { gte, lte, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (from) conditions.push(gte(deliveryTracking.createdAt, new Date(from)));
  if (to) conditions.push(lte(deliveryTracking.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(deliveryTracking).where(and(...conditions))
    : await db.select().from(deliveryTracking);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(deliveryTracking).values({
    amount: Number(body.amount) || 0, note: body.note,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(deliveryTracking).set({
    amount: Number(body.amount) || 0, note: body.note,
  }).where(eq(deliveryTracking.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(deliveryTracking).where(eq(deliveryTracking.id, Number(id)));
  return NextResponse.json({ success: true });
}
