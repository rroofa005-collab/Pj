import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { electronicServices } from "@/db/schema";
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
  if (search) conditions.push(like(electronicServices.name, `%${search}%`));
  if (from) conditions.push(gte(electronicServices.createdAt, new Date(from)));
  if (to) conditions.push(lte(electronicServices.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(electronicServices).where(and(...conditions))
    : await db.select().from(electronicServices);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // Get last record to calculate remaining dollar
  const last = await db.select().from(electronicServices).orderBy(electronicServices.id).limit(1000);
  const totalReceived = last.reduce((sum, r) => sum + (r.receivedDollar || 0), 0);
  const totalSpent = last.reduce((sum, r) => sum + (r.amountDollar || 0), 0);
  const currentReceived = Number(body.receivedDollar) || 0;
  const amountDollar = Number(body.amountDollar) || 0;
  const remainingDollar = (totalReceived + currentReceived) - (totalSpent + amountDollar);
  const result = await db.insert(electronicServices).values({
    receivedDollar: currentReceived,
    remainingDollar: remainingDollar,
    name: body.name, serviceType: body.serviceType,
    amountDollar: amountDollar,
    amountDinar: Number(body.amountDinar) || 0,
    status: body.status || "paid",
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(electronicServices).set({
    receivedDollar: Number(body.receivedDollar) || 0,
    remainingDollar: Number(body.remainingDollar) || 0,
    name: body.name, serviceType: body.serviceType,
    amountDollar: Number(body.amountDollar) || 0,
    amountDinar: Number(body.amountDinar) || 0,
    status: body.status || "paid",
  }).where(eq(electronicServices.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(electronicServices).where(eq(electronicServices.id, Number(id)));
  return NextResponse.json({ success: true });
}
