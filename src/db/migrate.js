const path = require("path");
const fs = require("fs");

try {
  const dbPath = process.env.DB_PATH || process.env.DATABASE_URL || "./data/database.db";
  const resolvedPath = path.resolve(dbPath);

  console.log("🚀 Database initialization...");
  console.log("📍 Path:", resolvedPath);

  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const Database = require("better-sqlite3");
  const sqlite = new Database(resolvedPath);

  sqlite.exec("PRAGMA foreign_keys = ON;");

  // Users
  sqlite.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    permissions TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    worker_id INTEGER,
    access_settings TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Workers
  sqlite.exec(`CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    salary REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Suppliers
  sqlite.exec(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    service_type TEXT,
    phone TEXT,
    note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Customer Debts
  sqlite.exec(`CREATE TABLE IF NOT EXISTS customer_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    service_or_product TEXT,
    total_amount REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    remaining_amount REAL DEFAULT 0,
    due_date TEXT,
    note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Supplier Debts
  sqlite.exec(`CREATE TABLE IF NOT EXISTS supplier_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    product TEXT,
    total_amount REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    remaining_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'unpaid',
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Expenses
  sqlite.exec(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL DEFAULT 0,
    note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Purchased Phones
  sqlite.exec(`CREATE TABLE IF NOT EXISTS purchased_phones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    phone_type TEXT,
    phone_details TEXT,
    serial_number TEXT,
    phone_condition TEXT,
    purchase_amount REAL DEFAULT 0,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Received Amounts
  sqlite.exec(`CREATE TABLE IF NOT EXISTS received_amounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nature TEXT NOT NULL,
    amount REAL DEFAULT 0,
    note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Maintenance
  sqlite.exec(`CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_type TEXT,
    fault TEXT,
    parts_cost REAL DEFAULT 0,
    labor_cost REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    due_amount REAL DEFAULT 0,
    net_profit REAL DEFAULT 0,
    status TEXT DEFAULT 'in_maintenance',
    status_note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Electronic Services
  sqlite.exec(`CREATE TABLE IF NOT EXISTS electronic_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    received_dollar REAL DEFAULT 0,
    remaining_dollar REAL DEFAULT 0,
    name TEXT NOT NULL,
    service_type TEXT,
    amount_dollar REAL DEFAULT 0,
    amount_dinar REAL DEFAULT 0,
    status TEXT DEFAULT 'paid',
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Orders
  sqlite.exec(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    product TEXT,
    total_amount_no_delivery REAL DEFAULT 0,
    wilaya TEXT,
    place TEXT,
    order_status TEXT DEFAULT 'pending',
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Installments
  sqlite.exec(`CREATE TABLE IF NOT EXISTS installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER REFERENCES workers(id),
    worker_name TEXT,
    nature TEXT,
    amount REAL DEFAULT 0,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Salaries
  sqlite.exec(`CREATE TABLE IF NOT EXISTS salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER REFERENCES workers(id),
    worker_name TEXT,
    base_salary REAL DEFAULT 0,
    bonuses REAL DEFAULT 0,
    penalties REAL DEFAULT 0,
    net_salary REAL DEFAULT 0,
    payment_date TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Treasury
  sqlite.exec(`CREATE TABLE IF NOT EXISTS treasury (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opening_balance REAL DEFAULT 0,
    program_balance REAL DEFAULT 0,
    actual_balance REAL DEFAULT 0,
    expenses REAL DEFAULT 0,
    purchases REAL DEFAULT 0,
    customer_debts REAL DEFAULT 0,
    received_amounts REAL DEFAULT 0,
    wages REAL DEFAULT 0,
    installments REAL DEFAULT 0,
    flexi REAL DEFAULT 0,
    maintenance REAL DEFAULT 0,
    note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Delivery Tracking
  sqlite.exec(`CREATE TABLE IF NOT EXISTS delivery_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL DEFAULT 0,
    note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Attendance
  sqlite.exec(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    worker_id INTEGER,
    worker_name TEXT,
    check_in INTEGER,
    check_out INTEGER,
    work_hours REAL DEFAULT 0,
    date TEXT,
    note TEXT
  )`);

  // App Settings
  sqlite.exec(`CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  )`);

  // External Maintenance
  sqlite.exec(`CREATE TABLE IF NOT EXISTS external_maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    phone_type TEXT,
    fault TEXT,
    repair_cost REAL DEFAULT 0,
    other_cost REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    amount_due REAL DEFAULT 0,
    technician_name TEXT,
    phone_status TEXT DEFAULT 'in_maintenance',
    payment_status TEXT DEFAULT 'unpaid',
    status_note TEXT,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  // Maintenance Installments
  sqlite.exec(`CREATE TABLE IF NOT EXISTS maintenance_installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maintenance_id INTEGER,
    amount REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    installment_date INTEGER,
    created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER))
  )`);

  console.log("✅ Tables created");

  // Check existing data
  const userCount = sqlite.prepare("SELECT COUNT(*) as c FROM users").get();
  console.log("📊 Existing users:", userCount.c);

  // Create admin if needed
  if (userCount.c === 0) {
    const hash = (p) => {
      let h = 0;
      for (let i = 0; i < p.length; i++) {
        h = (h << 5) - h + p.charCodeAt(i);
        h = h & h;
      }
      return Math.abs(h).toString(36) + p.length.toString(36);
    };
    sqlite.prepare(
      "INSERT INTO users (username, password, role, permissions, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run("Roofa", hash("Azer123"), "admin", "[]", 1, Math.floor(Date.now()/1000));
    console.log("✅ Admin: Roofa / Azer123");
  }

  // Language
  if (!sqlite.prepare("SELECT id FROM app_settings WHERE key='language'").get()) {
    sqlite.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)").run("language", "ar");
    console.log("✅ Arabic language");
  }

  // Stats
  console.log("\n📈 Statistics:");
  const tbls = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  tbls.forEach(t => {
    const c = sqlite.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get();
    console.log(`  ${t.name}: ${c.c}`);
  });

  sqlite.close();
  console.log("\n🎉 Database ready! Login: Roofa / Azer123");
} catch(e) {
  console.error("❌ Error:", e.message);
  process.exit(1);
}
