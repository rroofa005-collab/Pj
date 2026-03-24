import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { maintenance } from "@/db/schema";
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
  if (search) conditions.push(like(maintenance.name, `%${search}%`));
  if (from) conditions.push(gte(maintenance.createdAt, new Date(from)));
  if (to) conditions.push(lte(maintenance.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(maintenance).where(and(...conditions))
    : await db.select().from(maintenance);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parts = Number(body.partsCost) || 0;
  const labor = Number(body.laborCost) || 0;
  const total = parts + labor;
  const due = Number(body.dueAmount) || 0;
  const netProfit = due - total;
  const result = await db.insert(maintenance).values({
    name: body.name, phoneType: body.phoneType, fault: body.fault,
    partsCost: parts, laborCost: labor, totalCost: total,
    dueAmount: due, netProfit: netProfit,
    status: body.status || "in_maintenance", statusNote: body.statusNote,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parts = Number(body.partsCost) || 0;
  const labor = Number(body.laborCost) || 0;
  const total = parts + labor;
  const due = Number(body.dueAmount) || 0;
  const netProfit = due - total;
  const result = await db.update(maintenance).set({
    name: body.name, phoneType: body.phoneType, fault: body.fault,
    partsCost: parts, laborCost: labor, totalCost: total,
    dueAmount: due, netProfit: netProfit,
    status: body.status || "in_maintenance", statusNote: body.statusNote,
  }).where(eq(maintenance.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(maintenance).where(eq(maintenance.id, Number(id)));
  return NextResponse.json({ success: true });
}
