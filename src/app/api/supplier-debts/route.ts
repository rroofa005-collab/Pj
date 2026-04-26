import { NextRequest, NextResponse } from "next/server";
import { db, eq, and, like, gte, lte } from "@/lib/apiHelper";
import { supplierDebts } from "@/db/schema";
import { getSession } from "@/lib/server-auth";

function getStatus(remaining: number): string {
  if (remaining <= 0) return "paid";
  return "partial";
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (search) conditions.push(like(supplierDebts.name, `%${search}%`));
  if (from) conditions.push(gte(supplierDebts.createdAt, new Date(from)));
  if (to) conditions.push(lte(supplierDebts.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(supplierDebts).where(and(...conditions))
    : await db.select().from(supplierDebts);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const total = Number(body.totalAmount) || 0;
  const paid = Number(body.paidAmount) || 0;
  const remaining = total - paid;
  const status = paid === 0 ? "unpaid" : getStatus(remaining);
  const result = await db.insert(supplierDebts).values({
    name: body.name, product: body.product,
    totalAmount: total, paidAmount: paid, remainingAmount: remaining, status,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const total = Number(body.totalAmount) || 0;
  const paid = Number(body.paidAmount) || 0;
  const remaining = total - paid;
  const status = paid === 0 ? "unpaid" : getStatus(remaining);
  const result = await db.update(supplierDebts).set({
    name: body.name, product: body.product,
    totalAmount: total, paidAmount: paid, remainingAmount: remaining, status,
  }).where(eq(supplierDebts.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(supplierDebts).where(eq(supplierDebts.id, Number(id)));
  return NextResponse.json({ success: true });
}
