export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + password.length.toString(36);
}

export function createSessionToken(userId: number): string {
  return Buffer.from(JSON.stringify({ id: userId, ts: Date.now() })).toString(
    "base64"
  );
}

export const ALL_PAGES = [
  { key: "dashboard", labelAr: "لوحة التحكم", labelFr: "Tableau de bord", labelEn: "Dashboard" },
  { key: "workers", labelAr: "العمال", labelFr: "Travailleurs", labelEn: "Workers" },
  { key: "suppliers", labelAr: "الموردون", labelFr: "Fournisseurs", labelEn: "Suppliers" },
  { key: "customer-debts", labelAr: "ديون الزبائن", labelFr: "Dettes clients", labelEn: "Customer Debts" },
  { key: "supplier-debts", labelAr: "ديون الموردون", labelFr: "Dettes fournisseurs", labelEn: "Supplier Debts" },
  { key: "expenses", labelAr: "المصاريف", labelFr: "Dépenses", labelEn: "Expenses" },
  { key: "purchased-phones", labelAr: "الهواتف المشتراة", labelFr: "Téléphones achetés", labelEn: "Purchased Phones" },
  { key: "received-amounts", labelAr: "المبالغ المستلمة", labelFr: "Montants reçus", labelEn: "Received Amounts" },
  { key: "maintenance", labelAr: "الصيانة", labelFr: "Maintenance", labelEn: "Maintenance" },
  { key: "maintenance-tracking", labelAr: "تتبع الصيانة", labelFr: "Suivi maintenance", labelEn: "Maintenance Tracking" },
  { key: "external-maintenance", labelAr: "الصيانة الخارجية", labelFr: "Maintenance externe", labelEn: "External Maintenance" },
  { key: "electronic-services", labelAr: "الخدمات الإلكترونية", labelFr: "Services électroniques", labelEn: "Electronic Services" },
  { key: "orders", labelAr: "تتبع الطلبيات", labelFr: "Suivi commandes", labelEn: "Order Tracking" },
  { key: "installments", labelAr: "الأقساط", labelFr: "Versements", labelEn: "Installments" },
  { key: "salaries", labelAr: "الرواتب", labelFr: "Salaires", labelEn: "Salaries" },
  { key: "treasury", labelAr: "الخزينة", labelFr: "Trésorerie", labelEn: "Treasury" },
  { key: "delivery", labelAr: "تتبع التوصيل", labelFr: "Suivi livraison", labelEn: "Delivery Tracking" },
  { key: "attendance", labelAr: "الحضور والمغادرة", labelFr: "Présences", labelEn: "Attendance" },
  { key: "settings", labelAr: "الإعدادات", labelFr: "Paramètres", labelEn: "Settings" },
  { key: "admin", labelAr: "إدارة المستخدمين", labelFr: "Gestion utilisateurs", labelEn: "User Management" },
];