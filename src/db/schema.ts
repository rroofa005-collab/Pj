import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Users / Auth
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'admin' | 'user'
  permissions: text("permissions").notNull().default("[]"), // JSON array of page keys
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  workerId: integer("worker_id"),   // linked worker/employee
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Workers (العمال)
export const workers = sqliteTable("workers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  salary: real("salary").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Suppliers (الموردون)
export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  serviceType: text("service_type"),
  phone: text("phone"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Customer Debts (ديون الزبائن)
export const customerDebts = sqliteTable("customer_debts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  serviceOrProduct: text("service_or_product"),
  totalAmount: real("total_amount").notNull().default(0),
  paidAmount: real("paid_amount").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  dueDate: text("due_date"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Supplier Debts (ديون الموردون)
export const supplierDebts = sqliteTable("supplier_debts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  product: text("product"),
  totalAmount: real("total_amount").notNull().default(0),
  paidAmount: real("paid_amount").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  status: text("status").notNull().default("unpaid"), // 'paid' | 'partial' | 'unpaid'
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Expenses (المصاريف)
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Purchased Phones (الهواتف المشتراة)
export const purchasedPhones = sqliteTable("purchased_phones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  phoneType: text("phone_type"),
  phoneDetails: text("phone_details"),
  serialNumber: text("serial_number"),
  phoneCondition: text("phone_condition"),
  purchaseAmount: real("purchase_amount").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Received Amounts (المبالغ المستلمة)
export const receivedAmounts = sqliteTable("received_amounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nature: text("nature").notNull(),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Maintenance (الصيانة)
export const maintenance = sqliteTable("maintenance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phoneType: text("phone_type"),
  fault: text("fault"),
  partsCost: real("parts_cost").notNull().default(0),
  laborCost: real("labor_cost").notNull().default(0),
  totalCost: real("total_cost").notNull().default(0),
  dueAmount: real("due_amount").notNull().default(0),
  netProfit: real("net_profit").notNull().default(0),
  status: text("status").notNull().default("in_maintenance"), // 'ready' | 'in_maintenance' | 'returned'
  statusNote: text("status_note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Electronic Services (الخدمات الالكترونية)
export const electronicServices = sqliteTable("electronic_services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  receivedDollar: real("received_dollar").notNull().default(0),
  remainingDollar: real("remaining_dollar").notNull().default(0),
  name: text("name").notNull(),
  serviceType: text("service_type"),
  amountDollar: real("amount_dollar").notNull().default(0),
  amountDinar: real("amount_dinar").notNull().default(0),
  status: text("status").notNull().default("paid"), // 'paid' | 'debt'
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Order Tracking (تتبع الطلبيات)
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  product: text("product"),
  totalAmountNoDelivery: real("total_amount_no_delivery").notNull().default(0),
  wilaya: text("wilaya"),
  place: text("place"),
  orderStatus: text("order_status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Installments / Deductions (الاقساط)
export const installments = sqliteTable("installments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: integer("worker_id").references(() => workers.id),
  workerName: text("worker_name"),
  nature: text("nature"),
  amount: real("amount").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Salaries (الرواتب)
export const salaries = sqliteTable("salaries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workerId: integer("worker_id").references(() => workers.id),
  workerName: text("worker_name"),
  baseSalary: real("base_salary").notNull().default(0),
  bonuses: real("bonuses").notNull().default(0),
  penalties: real("penalties").notNull().default(0),
  netSalary: real("net_salary").notNull().default(0),
  paymentDate: text("payment_date"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Treasury (الخزينة)
export const treasury = sqliteTable("treasury", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openingBalance: real("opening_balance").notNull().default(0),
  programBalance: real("program_balance").notNull().default(0),
  actualBalance: real("actual_balance").notNull().default(0),
  expenses: real("expenses").notNull().default(0),
  purchases: real("purchases").notNull().default(0),
  customerDebts: real("customer_debts").notNull().default(0),
  receivedAmounts: real("received_amounts").notNull().default(0),
  wages: real("wages").notNull().default(0),
  installments: real("installments").notNull().default(0),
  flexi: real("flexi").notNull().default(0),
  maintenance: real("maintenance").notNull().default(0),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Delivery Tracking (تتبع التوصيل)
export const deliveryTracking = sqliteTable("delivery_tracking", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Attendance (الحضور)
export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  username: text("username"),
  workerId: integer("worker_id"),
  workerName: text("worker_name"),
  checkIn: integer("check_in", { mode: "timestamp" }),
  checkOut: integer("check_out", { mode: "timestamp" }),
  workHours: real("work_hours").default(0),
  date: text("date"), // "YYYY-MM-DD"
  note: text("note"),
});

// App Settings
export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// External Maintenance (الصيانة الخارجية)
export const externalMaintenance = sqliteTable("external_maintenance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  phoneType: text("phone_type"),
  fault: text("fault"),
  repairCost: real("repair_cost").notNull().default(0),
  otherCost: real("other_cost").notNull().default(0),
  totalCost: real("total_cost").notNull().default(0),
  amountDue: real("amount_due").notNull().default(0),
  technicianName: text("technician_name"),
  phoneStatus: text("phone_status").notNull().default("in_maintenance"), // 'in_maintenance' | 'ready' | 'returned'
  paymentStatus: text("payment_status").notNull().default("unpaid"), // 'paid' | 'unpaid'
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
