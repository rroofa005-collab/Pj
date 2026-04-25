import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function MaintenanceInstallmentsClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";

  const columns = [
    { key: "maintenanceName", label: t(language, "name") },
    { key: "amount", label: t(language, "amount"), type: "number" as const },
    { key: "paidAmount", label: t(language, "paidAmount"), type: "number" as const },
    { key: "installmentDate", label: t(language, "date"), type: "date" as const },
  ];

  const fields = [
    { key: "maintenanceId", label: "ID الصيانة", type: "number" as const },
    { key: "maintenanceName", label: t(language, "name"), type: "text" as const },
    { key: "amount", label: t(language, "amount"), type: "number" as const },
    { key: "paidAmount", label: t(language, "paidAmount"), type: "number" as const, readOnly: true },
    { key: "installmentDate", label: t(language, "date"), type: "date" as const },
  ];

  return (
    <PageWrapper
      title={`💰 ${t(language, "maintenance")} - قسط الصيانة`}
      apiPath="maintenance-installments"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ maintenanceId: 0, maintenanceName: "", amount: 0, paidAmount: 0, installmentDate: "" }}
    />
  );
}