import { pgTable, text, serial, real, boolean, timestamp, integer } from "drizzle-orm/pg-core";

// Users / Auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  permissions: text("permissions").notNull().default("[]"),
  isActive: boolean("is_active").notNull().default(true),
  workerId: integer("worker_id"),
  accessSettings: text("access_settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workers (العمال)
export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  salary: real("salary").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers (الموردون)
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serviceType: text("service_type"),
  phone: text("phone"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer Debts (ديون الزبائن)
export const customerDebts = pgTable("customer_debts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  serviceOrProduct: text("service_or_product"),
  totalAmount: real("total_amount").notNull().default(0),
  paidAmount: real("paid_amount").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  dueDate: text("due_date"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplier Debts (ديون الموردون)
export const supplierDebts = pgTable("supplier_debts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  product: text("product"),
  totalAmount: real("total_amount").notNull().default(0),
  paidAmount: real("paid_amount").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  status: text("status").notNull().default("unpaid"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses (المصاريف)
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchased Phones (الهواتف المشتراة)
export const purchasedPhones = pgTable("purchased_phones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  phoneType: text("phone_type"),
  phoneDetails: text("phone_details"),
  serialNumber: text("serial_number"),
  phoneCondition: text("phone_condition"),
  purchaseAmount: real("purchase_amount").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Received Amounts (المبالغ المستلمة)
export const receivedAmounts = pgTable("received_amounts", {
  id: serial("id").primaryKey(),
  nature: text("nature").notNull(),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Maintenance (الصيانة)
export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneType: text("phone_type"),
  fault: text("fault"),
  partsCost: real("parts_cost").notNull().default(0),
  laborCost: real("labor_cost").notNull().default(0),
  totalCost: real("total_cost").notNull().default(0),
  dueAmount: real("due_amount").notNull().default(0),
  netProfit: real("net_profit").notNull().default(0),
  status: text("status").notNull().default("in_maintenance"),
  statusNote: text("status_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Electronic Services (الخدمات الإلكترونية)
export const electronicServices = pgTable("electronic_services", {
  id: serial("id").primaryKey(),
  receivedDollar: real("received_dollar").notNull().default(0),
  remainingDollar: real("remaining_dollar").notNull().default(0),
  name: text("name").notNull(),
  serviceType: text("service_type"),
  amountDollar: real("amount_dollar").notNull().default(0),
  amountDinar: real("amount_dinar").notNull().default(0),
  status: text("status").notNull().default("paid"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order Tracking (تتبع الطلبيات)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  product: text("product"),
  totalAmountNoDelivery: real("total_amount_no_delivery").notNull().default(0),
  wilaya: text("wilaya"),
  place: text("place"),
  orderStatus: text("order_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Installments (الأقساط)
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").references(() => workers.id),
  workerName: text("worker_name"),
  nature: text("nature"),
  amount: real("amount").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Salaries (الرواتب)
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id").references(() => workers.id),
  workerName: text("worker_name"),
  baseSalary: real("base_salary").notNull().default(0),
  bonuses: real("bonuses").notNull().default(0),
  penalties: real("penalties").notNull().default(0),
  netSalary: real("net_salary").notNull().default(0),
  paymentDate: text("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Treasury (الخزينة)
export const treasury = pgTable("treasury", {
  id: serial("id").primaryKey(),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Delivery Tracking (تتبع التوصيل)
export const deliveryTracking = pgTable("delivery_tracking", {
  id: serial("id").primaryKey(),
  amount: real("amount").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance (الحضور)
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: text("username"),
  workerId: integer("worker_id"),
  workerName: text("worker_name"),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  workHours: real("work_hours").default(0),
  date: text("date"),
  note: text("note"),
});

// App Settings
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// External Maintenance (الصيانة الخارجية)
export const externalMaintenance = pgTable("external_maintenance", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  phoneType: text("phone_type"),
  fault: text("fault"),
  repairCost: real("repair_cost").notNull().default(0),
  otherCost: real("other_cost").notNull().default(0),
  totalCost: real("total_cost").notNull().default(0),
  amountDue: real("amount_due").notNull().default(0),
  technicianName: text("technician_name"),
  phoneStatus: text("phone_status").notNull().default("in_maintenance"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  statusNote: text("status_note"),
  createdAt: timestamp("created_at").defaultNow(),
});