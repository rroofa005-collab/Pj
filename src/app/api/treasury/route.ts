import { NextRequest, NextResponse } from "next/server";
import { and, db, eq, gte, lte } from "@/lib/apiHelper";
import { treasury } from "@/db/schema";
import { getSession } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (from) conditions.push(gte(treasury.createdAt, new Date(from)));
  if (to) conditions.push(lte(treasury.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(treasury).where(and(...conditions))
    : await db.select().from(treasury);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(treasury).values({
    openingBalance: Number(body.openingBalance) || 0,
    programBalance: Number(body.programBalance) || 0,
    actualBalance: Number(body.actualBalance) || 0,
    expenses: Number(body.expenses) || 0,
    purchases: Number(body.purchases) || 0,
    customerDebts: Number(body.customerDebts) || 0,
    receivedAmounts: Number(body.receivedAmounts) || 0,
    wages: Number(body.wages) || 0,
    installments: Number(body.installments) || 0,
    flexi: Number(body.flexi) || 0,
    maintenance: Number(body.maintenance) || 0,
    note: body.note,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(treasury).set({
    openingBalance: Number(body.openingBalance) || 0,
    programBalance: Number(body.programBalance) || 0,
    actualBalance: Number(body.actualBalance) || 0,
    expenses: Number(body.expenses) || 0,
    purchases: Number(body.purchases) || 0,
    customerDebts: Number(body.customerDebts) || 0,
    receivedAmounts: Number(body.receivedAmounts) || 0,
    wages: Number(body.wages) || 0,
    installments: Number(body.installments) || 0,
    flexi: Number(body.flexi) || 0,
    maintenance: Number(body.maintenance) || 0,
    note: body.note,
  }).where(eq(treasury.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(treasury).where(eq(treasury.id, Number(id)));
  return NextResponse.json({ success: true });
}
