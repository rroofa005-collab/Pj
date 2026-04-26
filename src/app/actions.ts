"use server";
import { eq } from "@/lib/apiHelper";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, appSettings } from "@/db/schema";
import { hashPassword, createSessionToken } from "@/lib/server-auth";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "invalidCredentials" };
  }

  const hashed = hashPassword(password);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user[0] || user[0].password !== hashed || !user[0].isActive) {
    return { error: "invalidCredentials" };
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
          return { error: "accessDeniedDay" };
        }
      }
      
      if (accessSettings.timeStart && accessSettings.timeEnd) {
        const [startH, startM] = accessSettings.timeStart.split(":").map(Number);
        const [endH, endM] = accessSettings.timeEnd.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        if (currentTime < startMinutes || currentTime > endMinutes) {
          return { error: "accessDenied" };
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

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}

export async function ensureAdminExists() {
  const existing = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({
      username: "Roofa",
      password: hashPassword("Azer123"),
      role: "admin",
      permissions: JSON.stringify([]),
      isActive: true,
    });
  }
}

export async function getLanguage(): Promise<string> {
  const setting = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "language"))
    .limit(1);
  return setting[0]?.value || "ar";
}

export async function setLanguage(lang: string) {
  const existing = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "language"))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(appSettings)
      .set({ value: lang })
      .where(eq(appSettings.key, "language"));
  } else {
    await db.insert(appSettings).values({ key: "language", value: lang });
  }
}
