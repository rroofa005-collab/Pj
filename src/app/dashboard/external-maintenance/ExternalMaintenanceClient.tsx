"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function ExternalMaintenanceClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";

  const columns: { key: string; label: string; type?: "badge" | "number" | "date"; badgeMap?: Record<string, string> }[] = [
    { key: "name", label: t(language, "name") },
    { key: "phone", label: t(language, "phone") },
    { key: "phoneType", label: t(language, "phoneType") },
    { key: "fault", label: t(language, "fault") },
    { key: "repairCost", label: t(language, "partsCost"), type: "number" },
    { key: "otherCost", label: t(language, "otherCost"), type: "number" },
    { key: "totalCost", label: t(language, "totalCost"), type: "number" },
    { key: "amountDue", label: t(language, "dueAmount"), type: "number" },
    ...(isAdmin ? [{ key: "profit", label: t(language, "profit"), type: "number" as const }] : []),
    { key: "technicianName", label: t(language, "technicianName") },
    {
      key: "phoneStatus", label: t(language, "phoneStatus"), type: "badge",
      badgeMap: { ready: "badge-success", in_maintenance: "badge-warning", returned: "badge-secondary" }
    },
    {
      key: "paymentStatus", label: t(language, "paymentStatus"), type: "badge",
      badgeMap: { paid: "badge-success", unpaid: "badge-danger" }
    },
    { key: "createdAt", label: t(language, "date"), type: "date" },
  ];

  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "phone", label: t(language, "phone"), type: "text" as const },
    { key: "phoneType", label: t(language, "phoneType"), type: "text" as const },
    { key: "fault", label: t(language, "fault"), type: "text" as const },
    { key: "repairCost", label: t(language, "partsCost"), type: "number" as const },
    { key: "otherCost", label: t(language, "otherCost"), type: "number" as const },
    { key: "totalCost", label: t(language, "totalCost"), type: "number" as const, readOnly: true },
    { key: "amountDue", label: t(language, "dueAmount"), type: "number" as const },
    { key: "technicianName", label: t(language, "technicianName"), type: "text" as const },
    {
      key: "phoneStatus", label: t(language, "phoneStatus"), type: "select" as const,
      options: [
        { value: "in_maintenance", label: t(language, "inMaintenance") },
        { value: "ready", label: t(language, "ready") },
        { value: "returned", label: t(language, "returned") },
      ]
    },
    {
      key: "paymentStatus", label: t(language, "paymentStatus"), type: "select" as const,
      options: [
        { value: "unpaid", label: t(language, "unpaid") },
        { value: "paid", label: t(language, "paidAndDelivered") },
      ]
    },
  ];

  return (
    <PageWrapper
      title={`🏪 ${t(language, "externalMaintenance")}`}
      apiPath="external-maintenance"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ 
        name: "", 
        phone: "", 
        phoneType: "", 
        fault: "", 
        repairCost: 0, 
        otherCost: 0, 
        totalCost: 0, 
        amountDue: 0, 
        profit: 0,
        technicianName: "",
        phoneStatus: "in_maintenance",
        paymentStatus: "unpaid"
      }}
      onBeforeSave={(data) => {
        const repair = Number(data.repairCost) || 0;
        const other = Number(data.otherCost) || 0;
        const total = repair + other;
        const due = Number(data.amountDue) || 0;
        return { ...data, totalCost: total, profit: due - total };
      }}
      summaryFromRows={(rows: Record<string, unknown>[]) => {
        const totalRepairCost = rows.reduce((s, r) => s + (Number(r.repairCost) || 0), 0);
        const totalOtherCost = rows.reduce((s, r) => s + (Number(r.otherCost) || 0), 0);
        const totalCost = rows.reduce((s, r) => s + (Number(r.totalCost) || 0), 0);
        const totalAmountDue = rows.reduce((s, r) => s + (Number(r.amountDue) || 0), 0);
        const totalProfit = rows.reduce((s, r) => s + ((Number(r.amountDue) || 0) - (Number(r.totalCost) || 0)), 0);

        const cards = [
          {
            label: language === "ar" ? "اجمالي تكلفة التصليح" : language === "fr" ? "Coût total réparation" : "Total Repair Cost",
            value: totalCost.toLocaleString() + " DA",
            icon: "🔧",
            color: "#6366f1",
            show: true,
          },
          {
            label: language === "ar" ? "اجمالي المبلغ المستحق" : language === "fr" ? "Total montant dû" : "Total Amount Due",
            value: totalAmountDue.toLocaleString() + " DA",
            icon: "💰",
            color: "#f59e0b",
            show: true,
          },
          {
            label: language === "ar" ? "الفائدة" : language === "fr" ? "Bénéfice" : "Profit",
            value: totalProfit.toLocaleString() + " DA",
            icon: "📈",
            color: "#10b981",
            show: isAdmin,
          },
        ];

        return (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px",
          }}>
            {cards.filter(c => c.show).map((card) => (
              <div
                key={card.label}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  border: "1px solid var(--border)",
                  borderTop: `4px solid ${card.color}`,
                  boxShadow: "0 2px 8px rgba(14,36,64,0.07)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: card.color }}>
                    {card.value}
                  </div>
                </div>
                <div style={{
                  fontSize: "1.6rem",
                  background: `${card.color}18`,
                  borderRadius: "8px",
                  padding: "6px",
                  lineHeight: 1,
                }}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}