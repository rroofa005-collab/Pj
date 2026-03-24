"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function MaintenanceClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";

  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "phoneType", label: t(language, "phoneType") },
    { key: "fault", label: t(language, "fault") },
    { key: "partsCost", label: t(language, "partsCost"), type: "number" as const },
    { key: "laborCost", label: t(language, "laborCost"), type: "number" as const },
    { key: "totalCost", label: t(language, "totalCost"), type: "number" as const },
    { key: "dueAmount", label: t(language, "dueAmount"), type: "number" as const },
    ...(isAdmin ? [{ key: "netProfit", label: t(language, "netProfit"), type: "number" as const }] : []),
    {
      key: "status", label: t(language, "status"), type: "badge" as const,
      badgeMap: { ready: "badge-success", in_maintenance: "badge-warning", returned: "badge-secondary" }
    },
    { key: "statusNote", label: t(language, "note") },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];

  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "phoneType", label: t(language, "phoneType"), type: "text" as const },
    { key: "fault", label: t(language, "fault"), type: "text" as const },
    { key: "partsCost", label: t(language, "partsCost"), type: "number" as const },
    { key: "laborCost", label: t(language, "laborCost"), type: "number" as const },
    { key: "totalCost", label: t(language, "totalCost"), type: "number" as const, readOnly: true },
    { key: "dueAmount", label: t(language, "dueAmount"), type: "number" as const },
    { key: "netProfit", label: t(language, "netProfit"), type: "number" as const, readOnly: true },
    {
      key: "status", label: t(language, "status"), type: "select" as const,
      options: [
        { value: "ready", label: t(language, "ready") },
        { value: "in_maintenance", label: t(language, "inMaintenance") },
        { value: "returned", label: t(language, "returned") },
      ]
    },
    { key: "statusNote", label: t(language, "note"), type: "textarea" as const },
  ];

  return (
    <PageWrapper
      title={`🔧 ${t(language, "maintenance")}`}
      apiPath="maintenance"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ name: "", phoneType: "", fault: "", partsCost: 0, laborCost: 0, totalCost: 0, dueAmount: 0, netProfit: 0, status: "in_maintenance", statusNote: "" }}
      onBeforeSave={(data) => {
        const parts = Number(data.partsCost) || 0;
        const labor = Number(data.laborCost) || 0;
        const total = parts + labor;
        const due = Number(data.dueAmount) || 0;
        return { ...data, totalCost: total, netProfit: due - total };
      }}
      summaryFromRows={(rows) => {
        const totalParts  = rows.reduce((s, r) => s + (Number(r.partsCost)  || 0), 0);
        const totalLabor  = rows.reduce((s, r) => s + (Number(r.laborCost)  || 0), 0);
        const totalProfit = rows.reduce((s, r) => s + (Number(r.netProfit)  || 0), 0);

        const cards = [
          {
            label: language === "ar" ? "إجمالي تكلفة القطع" : language === "fr" ? "Total pièces" : "Total Parts Cost",
            value: totalParts.toLocaleString() + " DA",
            icon: "🔩",
            color: "#ec4899",
            show: true,
          },
          {
            label: language === "ar" ? "إجمالي تكلفة اليد العاملة" : language === "fr" ? "Total main d'œuvre" : "Total Labor Cost",
            value: totalLabor.toLocaleString() + " DA",
            icon: "🛠️",
            color: "#f97316",
            show: true,
          },
          {
            label: language === "ar" ? "إجمالي الربح الصافي" : language === "fr" ? "Bénéfice net total" : "Total Net Profit",
            value: totalProfit.toLocaleString() + " DA",
            icon: "💹",
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
