import { NextRequest, NextResponse } from "next/server";
import { eq } from "@/lib/apiHelper";
import { cookies } from "next/headers";
import { hashPassword, createSessionToken } from "@/lib/server-auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 400 });
  }

  let user: any;
  try {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    user = result[0];
  } catch (e: any) {
    console.error("DB error:", e.message);
    return NextResponse.json({ error: "dbError", message: e.message }, { status: 500 });
  }

  if (!user || user.password !== hashPassword(password) || !user.isActive) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  // Check access control for non-admin users
  if (user.role !== "admin" && user.accessSettings) {
    try {
      const accessSettings = JSON.parse(user.accessSettings);
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
    } catch (e) {
      console.error("Access control error:", e);
    }
  }

  const token = createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
