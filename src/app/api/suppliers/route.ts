import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { suppliers } from "@/db/schema";
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
  if (search) conditions.push(like(suppliers.name, `%${search}%`));
  if (from) conditions.push(gte(suppliers.createdAt, new Date(from)));
  if (to) conditions.push(lte(suppliers.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(suppliers).where(and(...conditions))
    : await db.select().from(suppliers);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(suppliers).values({
    name: body.name, serviceType: body.serviceType, phone: body.phone, note: body.note,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.update(suppliers).set({
    name: body.name, serviceType: body.serviceType, phone: body.phone, note: body.note,
  }).where(eq(suppliers.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(suppliers).where(eq(suppliers.id, Number(id)));
  return NextResponse.json({ success: true });
}
