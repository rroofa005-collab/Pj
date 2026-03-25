const { Client } = require("pg");

async function migrate() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.log("ℹ️ No DATABASE_URL found - skipping migration (tables will be created on first use)");
    process.exit(0);
  }

  const client = new Client(connectionString);
  
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    // Create tables
    console.log("✅ Creating database tables...");

    // Users table
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      permissions TEXT NOT NULL DEFAULT '[]',
      is_active BOOLEAN NOT NULL DEFAULT true,
      worker_id INTEGER,
      access_settings TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Workers table
    await client.query(`CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      salary REAL NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Suppliers table
    await client.query(`CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      service_type TEXT,
      phone TEXT,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Customer Debts table
    await client.query(`CREATE TABLE IF NOT EXISTS customer_debts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      service_or_product TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      due_date TEXT,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Supplier Debts table
    await client.query(`CREATE TABLE IF NOT EXISTS supplier_debts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      product TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unpaid',
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Expenses table
    await client.query(`CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Purchased Phones table
    await client.query(`CREATE TABLE IF NOT EXISTS purchased_phones (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      phone_type TEXT,
      phone_details TEXT,
      serial_number TEXT,
      phone_condition TEXT,
      purchase_amount REAL NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Received Amounts table
    await client.query(`CREATE TABLE IF NOT EXISTS received_amounts (
      id SERIAL PRIMARY KEY,
      nature TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Maintenance table
    await client.query(`CREATE TABLE IF NOT EXISTS maintenance (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Electronic Services table
    await client.query(`CREATE TABLE IF NOT EXISTS electronic_services (
      id SERIAL PRIMARY KEY,
      received_dollar REAL NOT NULL DEFAULT 0,
      remaining_dollar REAL NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      service_type TEXT,
      amount_dollar REAL NOT NULL DEFAULT 0,
      amount_dinar REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'paid',
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Orders table
    await client.query(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      product TEXT,
      total_amount_no_delivery REAL NOT NULL DEFAULT 0,
      wilaya TEXT,
      place TEXT,
      order_status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Installments table
    await client.query(`CREATE TABLE IF NOT EXISTS installments (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER REFERENCES workers(id),
      worker_name TEXT,
      nature TEXT,
      amount REAL NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Salaries table
    await client.query(`CREATE TABLE IF NOT EXISTS salaries (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER REFERENCES workers(id),
      worker_name TEXT,
      base_salary REAL NOT NULL DEFAULT 0,
      bonuses REAL NOT NULL DEFAULT 0,
      penalties REAL NOT NULL DEFAULT 0,
      net_salary REAL NOT NULL DEFAULT 0,
      payment_date TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Treasury table
    await client.query(`CREATE TABLE IF NOT EXISTS treasury (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Delivery Tracking table
    await client.query(`CREATE TABLE IF NOT EXISTS delivery_tracking (
      id SERIAL PRIMARY KEY,
      amount REAL NOT NULL DEFAULT 0,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Attendance table
    await client.query(`CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username TEXT,
      worker_id INTEGER,
      worker_name TEXT,
      check_in TIMESTAMP,
      check_out TIMESTAMP,
      work_hours REAL DEFAULT 0,
      date TEXT,
      note TEXT
    )`);

    // App Settings table
    await client.query(`CREATE TABLE IF NOT EXISTS app_settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    )`);

    // External Maintenance table
    await client.query(`CREATE TABLE IF NOT EXISTS external_maintenance (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    console.log("✅ All tables created");

    // Create default admin user if not exists
    const adminResult = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminResult.rows.length === 0) {
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
      await client.query(
        "INSERT INTO users (username, password, role, permissions, is_active, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
        ["Roofa", hashedPassword, "admin", "[]", true]
      );
      console.log("✅ Admin user created: Roofa / Azer123");
    }

    // Create default language setting if not exists
    const langResult = await client.query("SELECT id FROM app_settings WHERE key = 'language' LIMIT 1");
    if (langResult.rows.length === 0) {
      await client.query("INSERT INTO app_settings (key, value) VALUES ($1, $2)", ["language", "ar"]);
      console.log("✅ Language setting created: Arabic");
    }

    console.log("✅ DB init complete");
  } catch (e) {
    console.error("❌ DB init failed:", e.message);
  } finally {
    await client.end();
  }
  
  process.exit(0);
}

migrate();