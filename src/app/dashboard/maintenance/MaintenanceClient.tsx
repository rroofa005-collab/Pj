"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function MaintenanceClient({ lang }: { lang: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "phoneType", label: t(language, "phoneType") },
    { key: "fault", label: t(language, "fault") },
    { key: "partsCost", label: t(language, "partsCost"), type: "number" as const },
    { key: "laborCost", label: t(language, "laborCost"), type: "number" as const },
    { key: "totalCost", label: t(language, "totalCost"), type: "number" as const },
    { key: "dueAmount", label: t(language, "dueAmount"), type: "number" as const },
    { key: "netProfit", label: t(language, "netProfit"), type: "number" as const },
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
      defaultValues={{ name: "", phoneType: "", fault: "", partsCost: 0, laborCost: 0, totalCost: 0, dueAmount: 0, netProfit: 0, status: "in_maintenance", statusNote: "" }}
      onBeforeSave={(data) => {
        const parts = Number(data.partsCost) || 0;
        const labor = Number(data.laborCost) || 0;
        const total = parts + labor;
        const due = Number(data.dueAmount) || 0;
        return { ...data, totalCost: total, netProfit: due - total };
      }}
    />
  );
}
