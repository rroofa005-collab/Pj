import { NextRequest, NextResponse } from "next/server";
import { and, db, eq, gte, like, lte } from "@/lib/apiHelper";
import { workers } from "@/db/schema";
import { getSession } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [];
  if (search) conditions.push(like(workers.name, `%${search}%`));
  if (from) conditions.push(gte(workers.createdAt, new Date(from)));
  if (to) conditions.push(lte(workers.createdAt, new Date(to)));

  const rows = conditions.length > 0
    ? await db.select().from(workers).where(and(...conditions))
    : await db.select().from(workers);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = await db.insert(workers).values({
    name: body.name,
    phone: body.phone,
    salary: Number(body.salary) || 0,
    isActive: body.isActive !== false,
  }).returning();

  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = await db.update(workers).set({
    name: body.name,
    phone: body.phone,
    salary: Number(body.salary) || 0,
    isActive: body.isActive !== false,
  }).where(eq(workers.id, body.id)).returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.delete(workers).where(eq(workers.id, Number(id)));
  return NextResponse.json({ success: true });
}
