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
    { key: "amountDue", label: t(language, "dueAmount"), type: "number" },
    { key: "technicianName", label: t(language, "technicianName") },
    {
      key: "phoneStatus", label: t(language, "phoneStatus"), type: "badge",
      badgeMap: { ready: "badge-success", in_maintenance: "badge-warning", returned: "badge-secondary" }
    },
    { key: "createdAt", label: t(language, "date"), type: "date" },
  ];

  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "phone", label: t(language, "phone"), type: "text" as const },
    { key: "phoneType", label: t(language, "phoneType"), type: "text" as const },
    { key: "fault", label: t(language, "fault"), type: "textarea" as const },
    { key: "repairCost", label: t(language, "partsCost"), type: "number" as const },
    { key: "otherCost", label: t(language, "otherCost"), type: "number" as const },
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
        amountDue: 0, 
        technicianName: "",
        phoneStatus: "in_maintenance",
        paymentStatus: "unpaid"
      }}
      onBeforeSave={(data) => {
        return data;
      }}
      summaryFromRows={(rows: Record<string, unknown>[]) => {
        const totalRepairCost = rows.reduce((s, r) => s + (Number(r.repairCost) || 0), 0);
        const totalOtherCost = rows.reduce((s, r) => s + (Number(r.otherCost) || 0), 0);
        const totalAmountDue = rows.reduce((s, r) => s + (Number(r.amountDue) || 0), 0);

        const cards = [
          {
            label: language === "ar" ? "اجمالي تكلفة القطع" : language === "fr" ? "Total pièces" : "Total Parts Cost",
            value: totalRepairCost.toLocaleString() + " DA",
            icon: "🔩",
            color: "#6366f1",
            show: true,
          },
          {
            label: language === "ar" ? "اجمالي التكلفة الأخرى" : language === "fr" ? "Total autre coût" : "Total Other Cost",
            value: totalOtherCost.toLocaleString() + " DA",
            icon: "🛠️",
            color: "#f59e0b",
            show: true,
          },
          {
            label: language === "ar" ? "اجمالي المبلغ المستحق" : language === "fr" ? "Total montant dû" : "Total Amount Due",
            value: totalAmountDue.toLocaleString() + " DA",
            icon: "💰",
            color: "#10b981",
            show: true,
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