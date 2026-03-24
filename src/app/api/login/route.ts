import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 400 });
  }

  const hashed = hashPassword(password);
  const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (!user[0] || user[0].password !== hashed || !user[0].isActive) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  const token = createSessionToken(user[0].id);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
