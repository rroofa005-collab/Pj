import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSessionToken } from "@/lib/server-auth";

function ensureAdminExists() {
  try {
    const existing = db.select().from(users).where(eq(users.username, "Roofa")).limit(1);
    // Note: In Drizzle, we need to check differently - this is just a placeholder
    // The actual creation happens in migrate.js
  } catch {}
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 400 });
  }

  const hashed = hashPassword(password);
  
  let user;
  try {
    user = await db.select().from(users).where(eq(users.username, username)).limit(1);
  } catch (e) {
    // Database not ready - try to create tables
    console.error("DB error:", e);
    return NextResponse.json({ error: "dbNotReady" }, { status: 500 });
  }

  if (!user[0] || user[0].password !== hashed || !user[0].isActive) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  // Check access control for non-admin users
  if (user[0].role !== "admin" && user[0].accessSettings) {
    try {
      const accessSettings = JSON.parse(user[0].accessSettings as string);
      const now = new Date();
      const currentDay = String(now.getDay());
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      if (accessSettings.days && accessSettings.days.length > 0) {
        if (!accessSettings.days.includes(currentDay)) {
          return NextResponse.json({ error: "accessDeniedDay" }, { status: 403 });
        }
      }
      
      if (accessSettings.timeStart && accessSettings.timeEnd) {
        const [startH, startM] = accessSettings.timeStart.split(":").map(Number);
        const [endH, endM] = accessSettings.timeEnd.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        if (currentTime < startMinutes || currentTime > endMinutes) {
          return NextResponse.json({ error: "accessDenied" }, { status: 403 });
        }
      }
    } catch {}
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