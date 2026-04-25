import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { externalMaintenance } from "@/db/schema";
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
  if (search) conditions.push(like(externalMaintenance.name, `%${search}%`));
  if (from) conditions.push(gte(externalMaintenance.createdAt, new Date(from)));
  if (to) conditions.push(lte(externalMaintenance.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(externalMaintenance).where(and(...conditions))
    : await db.select().from(externalMaintenance);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const repairCost = Number(body.repairCost) || 0;
  const otherCost = Number(body.otherCost) || 0;
  const totalCost = repairCost + otherCost;
  const amountDue = Number(body.amountDue) || 0;
  const result = await db.insert(externalMaintenance).values({
    name: body.name,
    phone: body.phone,
    phoneType: body.phoneType,
    fault: body.fault,
    repairCost: repairCost,
    otherCost: otherCost,
    totalCost: totalCost,
    amountDue: amountDue,
    technicianName: body.technicianName,
    phoneStatus: body.phoneStatus || "in_maintenance",
    paymentStatus: body.paymentStatus || "unpaid",
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const repairCost = Number(body.repairCost) || 0;
  const otherCost = Number(body.otherCost) || 0;
  const totalCost = repairCost + otherCost;
  const amountDue = Number(body.amountDue) || 0;
  const result = await db.update(externalMaintenance).set({
    name: body.name,
    phone: body.phone,
    phoneType: body.phoneType,
    fault: body.fault,
    repairCost: repairCost,
    otherCost: otherCost,
    totalCost: totalCost,
    amountDue: amountDue,
    technicianName: body.technicianName,
    phoneStatus: body.phoneStatus || body.status || "in_maintenance",
    paymentStatus: body.paymentStatus || "unpaid",
    statusNote: body.statusNote || null,
  }).where(eq(externalMaintenance.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(externalMaintenance).where(eq(externalMaintenance.id, Number(id)));
  return NextResponse.json({ success: true });
}