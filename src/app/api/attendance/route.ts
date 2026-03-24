import { NextRequest, NextResponse } from "next/server";
import { db, eq, and, gte, lte, like } from "@/lib/apiHelper";
import { attendance, users, workers } from "@/db/schema";
import { getSession } from "@/lib/server-auth";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const from   = searchParams.get("from")   || "";
  const to     = searchParams.get("to")     || "";

  if (session.role === "admin") {
    // Admin: return all records with filters
    const conditions = [];
    if (from)    conditions.push(gte(attendance.date, from));
    if (to)      conditions.push(lte(attendance.date, to));
    if (search)  conditions.push(like(attendance.username, `%${search}%`));
    const rows = conditions.length > 0
      ? await db.select().from(attendance).where(and(...conditions)).orderBy(attendance.checkIn)
      : await db.select().from(attendance).orderBy(attendance.checkIn);
    return NextResponse.json(rows);
  } else {
    // User: return their own records
    const conditions = [eq(attendance.userId, session.id)];
    if (from)   conditions.push(gte(attendance.date, from));
    if (to)     conditions.push(lte(attendance.date, to));
    const rows = await db.select().from(attendance).where(and(...conditions)).orderBy(attendance.checkIn);
    return NextResponse.json(rows);
  }
}

export async function POST(req: NextRequest) {
  // Check In
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = todayStr();

  // Check if already checked in today without checking out
  const existing = await db.select().from(attendance)
    .where(and(eq(attendance.userId, session.id), eq(attendance.date, today)));
  const openRecord = existing.find(r => !r.checkOut);
  if (openRecord) {
    return NextResponse.json({ error: "Already checked in" }, { status: 400 });
  }

  // Get linked worker info
  const userRow = await db.select().from(users).where(eq(users.id, session.id));
  const workerId = userRow[0]?.workerId ?? null;
  let workerName = null;
  if (workerId) {
    const workerRow = await db.select().from(workers).where(eq(workers.id, workerId));
    workerName = workerRow[0]?.name ?? null;
  }

  const now = new Date();
  const row = await db.insert(attendance).values({
    userId: session.id,
    username: session.username,
    workerId: workerId ?? undefined,
    workerName: workerName ?? undefined,
    checkIn: now,
    date: today,
  }).returning();

  return NextResponse.json(row[0]);
}

export async function PUT(req: NextRequest) {
  // Check Out
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Find the record
  const rows = await db.select().from(attendance).where(eq(attendance.id, id));
  const record = rows[0];
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only owner or admin can check out
  if (session.role !== "admin" && record.userId !== session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const checkInTime = record.checkIn ? new Date(record.checkIn) : now;
  const diffMs = now.getTime() - checkInTime.getTime();
  const workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

  const updated = await db.update(attendance).set({
    checkOut: now,
    workHours,
  }).where(eq(attendance.id, id)).returning();

  return NextResponse.json(updated[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.delete(attendance).where(eq(attendance.id, Number(id)));
  return NextResponse.json({ success: true });
}
