import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { customerDebts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { gte, lte, and, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (search) conditions.push(like(customerDebts.name, `%${search}%`));
  if (from) conditions.push(gte(customerDebts.createdAt, new Date(from)));
  if (to) conditions.push(lte(customerDebts.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(customerDebts).where(and(...conditions))
    : await db.select().from(customerDebts);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const total = Number(body.totalAmount) || 0;
  const paid = Number(body.paidAmount) || 0;
  const remaining = total - paid;
  const result = await db.insert(customerDebts).values({
    name: body.name, phone: body.phone, serviceOrProduct: body.serviceOrProduct,
    totalAmount: total, paidAmount: paid, remainingAmount: remaining,
    dueDate: body.dueDate, note: body.note,
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
  const result = await db.update(customerDebts).set({
    name: body.name, phone: body.phone, serviceOrProduct: body.serviceOrProduct,
    totalAmount: total, paidAmount: paid, remainingAmount: remaining,
    dueDate: body.dueDate, note: body.note,
  }).where(eq(customerDebts.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(customerDebts).where(eq(customerDebts.id, Number(id)));
  return NextResponse.json({ success: true });
}
