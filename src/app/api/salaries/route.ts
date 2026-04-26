import { NextRequest, NextResponse } from "next/server";
import { and, db, eq, gte, like, lte } from "@/lib/apiHelper";
import { salaries } from "@/db/schema";
import { getSession } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const conditions = [];
  if (search) conditions.push(like(salaries.workerName, `%${search}%`));
  if (from) conditions.push(gte(salaries.createdAt, new Date(from)));
  if (to) conditions.push(lte(salaries.createdAt, new Date(to)));
  const rows = conditions.length > 0
    ? await db.select().from(salaries).where(and(...conditions))
    : await db.select().from(salaries);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const base = Number(body.baseSalary) || 0;
  const bonuses = Number(body.bonuses) || 0;
  const penalties = Number(body.penalties) || 0;
  const net = base + bonuses - penalties;
  const result = await db.insert(salaries).values({
    workerId: body.workerId ? Number(body.workerId) : null,
    workerName: body.workerName, baseSalary: base,
    bonuses: bonuses, penalties: penalties, netSalary: net,
    paymentDate: body.paymentDate,
  }).returning();
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const base = Number(body.baseSalary) || 0;
  const bonuses = Number(body.bonuses) || 0;
  const penalties = Number(body.penalties) || 0;
  const net = base + bonuses - penalties;
  const result = await db.update(salaries).set({
    workerId: body.workerId ? Number(body.workerId) : null,
    workerName: body.workerName, baseSalary: base,
    bonuses: bonuses, penalties: penalties, netSalary: net,
    paymentDate: body.paymentDate,
  }).where(eq(salaries.id, body.id)).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(salaries).where(eq(salaries.id, Number(id)));
  return NextResponse.json({ success: true });
}
