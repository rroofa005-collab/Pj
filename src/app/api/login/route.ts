import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashPassword, createSessionToken } from "@/lib/server-auth";
import path from "path";
import fs from "fs";

function hashPasswordSimple(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + password.length.toString(36);
}

function getDbPath(): string {
  // Try multiple paths for Railway compatibility
  const paths = [
    process.env.DB_PATH,
    path.join(process.cwd(), "data", "database.db"),
    "/tmp/data/database.db",
    path.join(process.cwd(), "database.db"),
  ];
  
  for (const p of paths) {
    if (p) {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch {}
      }
      return p;
    }
  }
  return path.join(process.cwd(), "data", "database.db");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 400 });
  }

  let user: any = null;
  let dbPath = "";

  try {
    const Database = require("better-sqlite3");
    dbPath = getDbPath();
    
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const sqlite = new Database(dbPath);
    
    // Create tables if not exists
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
    
    console.log("DB path used:", dbPath);
  } catch (e: any) {
    console.error("DB error:", e.message);
    return NextResponse.json({ error: "dbError", message: e.message }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  const hashed = hashPassword(password);
  if (user.password !== hashed || !user.is_active) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
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