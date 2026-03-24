import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashPassword, createSessionToken } from "@/lib/server-auth";

function hashPasswordSimple(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + password.length.toString(36);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 400 });
  }

  // Direct SQLite check - bypass Drizzle for reliability
  let user: any = null;
  
  try {
    // Try to load better-sqlite3 directly
    const Database = require("better-sqlite3");
    const dbPath = process.env.DB_PATH || "./data/database.db";
    const sqlite = new Database(dbPath, { readonly: true });
    
    user = sqlite.prepare("SELECT * FROM users WHERE username = ?").get(username);
    sqlite.close();
  } catch (e) {
    // Database might not exist yet or not initialized
    console.error("DB read error:", e);
    
    // Try to initialize the database
    try {
      const Database = require("better-sqlite3");
      const dbPath = process.env.DB_PATH || "./data/database.db";
      const path = require("path");
      const fs = require("fs");
      
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const sqlite = new Database(dbPath);
      
      // Create tables
      sqlite.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        permissions TEXT DEFAULT '[]',
        is_active INTEGER DEFAULT 1,
        worker_id INTEGER,
        access_settings TEXT,
        created_at INTEGER
      )`);
      
      // Create admin if not exists
      const existing = sqlite.prepare("SELECT id FROM users WHERE username = 'Roofa'").get();
      if (!existing) {
        const hashed = hashPasswordSimple("Azer123");
        sqlite.prepare("INSERT INTO users (username, password, role, permissions, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)")
          .run("Roofa", hashed, "admin", "[]", 1, Date.now());
      }
      
      user = sqlite.prepare("SELECT * FROM users WHERE username = ?").get(username);
      sqlite.close();
    } catch (e2) {
      console.error("DB init error:", e2);
    }
  }

  if (!user) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  const hashed = hashPassword(password);
  if (user.password !== hashed || !user.is_active) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  // Check access control for non-admin users
  if (user.role !== "admin" && user.access_settings) {
    try {
      const accessSettings = JSON.parse(user.access_settings);
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

  const token = createSessionToken(user.id);
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