import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { orders } from "@/db/schema";
import { getSession } from "@/lib/server-auth";
import { gte, lte, and, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (search) conditions.push(like(orders.name, `%${search}%`));
  if (from) conditions.push(gte(orders.createdAt, new Date(from)));
  if (to) conditions.push(lte(orders.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(orders).where(and(...conditions))
    : await db.select().from(orders);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(orders).values({
    name: body.name, product: body.product,
    totalAmountNoDelivery: Number(body.totalAmountNoDelivery) || 0,
    wilaya: body.wilaya, orderStatus: body.orderStatus || "pending",
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(orders).set({
    name: body.name, product: body.product,
    totalAmountNoDelivery: Number(body.totalAmountNoDelivery) || 0,
    wilaya: body.wilaya, orderStatus: body.orderStatus || "pending",
  }).where(eq(orders.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(orders).where(eq(orders.id, Number(id)));
  return NextResponse.json({ success: true });
}
