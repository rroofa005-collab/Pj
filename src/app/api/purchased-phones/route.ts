import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { purchasedPhones } from "@/db/schema";
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
  if (search) conditions.push(like(purchasedPhones.name, `%${search}%`));
  if (from) conditions.push(gte(purchasedPhones.createdAt, new Date(from)));
  if (to) conditions.push(lte(purchasedPhones.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(purchasedPhones).where(and(...conditions))
    : await db.select().from(purchasedPhones);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(purchasedPhones).values({
    name: body.name, phone: body.phone, phoneType: body.phoneType,
    phoneDetails: body.phoneDetails, serialNumber: body.serialNumber,
    phoneCondition: body.phoneCondition, purchaseAmount: Number(body.purchaseAmount) || 0,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(purchasedPhones).set({
    name: body.name, phone: body.phone, phoneType: body.phoneType,
    phoneDetails: body.phoneDetails, serialNumber: body.serialNumber,
    phoneCondition: body.phoneCondition, purchaseAmount: Number(body.purchaseAmount) || 0,
  }).where(eq(purchasedPhones.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(purchasedPhones).where(eq(purchasedPhones.id, Number(id)));
  return NextResponse.json({ success: true });
}
