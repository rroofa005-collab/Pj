import { NextRequest, NextResponse } from "next/server";
import { db, eq } from "@/lib/apiHelper";
import { users } from "@/db/schema";
import { getSession } from "@/lib/server-auth";
import { hashPassword } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select({
    id: users.id,
    username: users.username,
    role: users.role,
    permissions: users.permissions,
    isActive: users.isActive,
    createdAt: users.createdAt,
  }).from(users);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(users).values({
    username: body.username,
    password: hashPassword(body.password),
    role: body.role || "user",
    permissions: JSON.stringify(body.permissions || []),
    isActive: body.isActive !== false,
  }).returning({ id: users.id, username: users.username, role: users.role, permissions: users.permissions, isActive: users.isActive });
  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const updateData: Record<string, unknown> = {
    username: body.username,
    role: body.role || "user",
    permissions: JSON.stringify(body.permissions || []),
    isActive: body.isActive !== false,
  };
  if (body.password) {
    updateData.password = hashPassword(body.password);
  }
  const result = await db.update(users).set(updateData).where(eq(users.id, body.id))
    .returning({ id: users.id, username: users.username, role: users.role, permissions: users.permissions, isActive: users.isActive });
  return NextResponse.json(result[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  // Don't allow deleting self
  if (Number(id) === session.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  await db.delete(users).where(eq(users.id, Number(id)));
  return NextResponse.json({ success: true });
}
