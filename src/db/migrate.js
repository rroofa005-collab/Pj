const path = require("path");
const fs = require("fs");

try {
  const dbPath = process.env.DB_PATH || "./data/database.db";
  const resolvedPath = path.resolve(dbPath);

  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const Database = require("better-sqlite3");
  const sqlite = new Database(resolvedPath);

  console.log("✅ Creating database tables...");

  // Users table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    permissions TEXT NOT NULL DEFAULT '[]',
    is_active INTEGER NOT NULL DEFAULT 1,
    worker_id INTEGER,
    access_settings TEXT,
    created_at INTEGER
  )`);

  // Workers table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    salary REAL NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER
  )`);

  // Suppliers table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    service_type TEXT,
    phone TEXT,
    note TEXT,
    created_at INTEGER
  )`);

  // Customer Debts table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS customer_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    service_or_product TEXT,
    total_amount REAL NOT NULL DEFAULT 0,
    paid_amount REAL NOT NULL DEFAULT 0,
    remaining_amount REAL NOT NULL DEFAULT 0,
    due_date TEXT,
    note TEXT,
    created_at INTEGER
  )`);

  // Supplier Debts table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS supplier_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    product TEXT,
    total_amount REAL NOT NULL DEFAULT 0,
    paid_amount REAL NOT NULL DEFAULT 0,
    remaining_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'unpaid',
    created_at INTEGER
  )`);

  // Expenses table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    note TEXT,
    created_at INTEGER
  )`);

  // Purchased Phones table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS purchased_phones (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    phone_type TEXT,
    phone_details TEXT,
    serial_number TEXT,
    phone_condition TEXT,
    purchase_amount REAL NOT NULL DEFAULT 0,
    created_at INTEGER
  )`);

  // Received Amounts table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS received_amounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    nature TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    note TEXT,
    created_at INTEGER
  )`);

  // Maintenance table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    phone_type TEXT,
    fault TEXT,
    parts_cost REAL NOT NULL DEFAULT 0,
    labor_cost REAL NOT NULL DEFAULT 0,
    total_cost REAL NOT NULL DEFAULT 0,
    due_amount REAL NOT NULL DEFAULT 0,
    net_profit REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_maintenance',
    status_note TEXT,
    created_at INTEGER
  )`);

  // Electronic Services table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS electronic_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    received_dollar REAL NOT NULL DEFAULT 0,
    remaining_dollar REAL NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    service_type TEXT,
    amount_dollar REAL NOT NULL DEFAULT 0,
    amount_dinar REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'paid',
    created_at INTEGER
  )`);

  // Orders table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    product TEXT,
    total_amount_no_delivery REAL NOT NULL DEFAULT 0,
    wilaya TEXT,
    place TEXT,
    order_status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER
  )`);

  // Installments table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    worker_id INTEGER REFERENCES workers(id),
    worker_name TEXT,
    nature TEXT,
    amount REAL NOT NULL DEFAULT 0,
    created_at INTEGER
  )`);

  // Salaries table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    worker_id INTEGER REFERENCES workers(id),
    worker_name TEXT,
    base_salary REAL NOT NULL DEFAULT 0,
    bonuses REAL NOT NULL DEFAULT 0,
    penalties REAL NOT NULL DEFAULT 0,
    net_salary REAL NOT NULL DEFAULT 0,
    payment_date TEXT,
    created_at INTEGER
  )`);

  // Treasury table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS treasury (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    opening_balance REAL NOT NULL DEFAULT 0,
    program_balance REAL NOT NULL DEFAULT 0,
    actual_balance REAL NOT NULL DEFAULT 0,
    expenses REAL NOT NULL DEFAULT 0,
    purchases REAL NOT NULL DEFAULT 0,
    customer_debts REAL NOT NULL DEFAULT 0,
    received_amounts REAL NOT NULL DEFAULT 0,
    wages REAL NOT NULL DEFAULT 0,
    installments REAL NOT NULL DEFAULT 0,
    flexi REAL NOT NULL DEFAULT 0,
    maintenance REAL NOT NULL DEFAULT 0,
    note TEXT,
    created_at INTEGER
  )`);

  // Delivery Tracking table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS delivery_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    note TEXT,
    created_at INTEGER
  )`);

  // Attendance table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
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

  // App Settings table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  )`);

  // Maintenance Installments table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS maintenance_installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    maintenance_id INTEGER,
    amount REAL NOT NULL DEFAULT 0,
    paid_amount REAL NOT NULL DEFAULT 0,
    installment_date INTEGER,
    created_at INTEGER
  )`);

  // External Maintenance table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS external_maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    phone_type TEXT,
    fault TEXT,
    repair_cost REAL NOT NULL DEFAULT 0,
    other_cost REAL NOT NULL DEFAULT 0,
    total_cost REAL NOT NULL DEFAULT 0,
    amount_due REAL NOT NULL DEFAULT 0,
    technician_name TEXT,
    phone_status TEXT NOT NULL DEFAULT 'in_maintenance',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    status_note TEXT,
    created_at INTEGER
  )`);

  console.log("✅ All tables created");

  // Create default admin user if not exists
  const adminExists = sqlite.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (!adminExists) {
    const hashPassword = (password) => {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36) + password.length.toString(36);
    };

    const hashedPassword = hashPassword("Azer123");
    sqlite.prepare(`INSERT INTO users (username, password, role, permissions, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run("Roofa", hashedPassword, "admin", "[]", 1, Date.now());
    console.log("✅ Admin user created: Roofa / Azer123");
  }

  // Create default language setting if not exists
  const langExists = sqlite.prepare("SELECT id FROM app_settings WHERE key = 'language'").get();
  if (!langExists) {
    sqlite.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)").run("language", "ar");
    console.log("✅ Language setting created: Arabic");
  }

  sqlite.close();
  console.log("✅ DB init complete");
} catch (e) {
  console.error("❌ DB init failed:", e.message);
}

process.exit(0);