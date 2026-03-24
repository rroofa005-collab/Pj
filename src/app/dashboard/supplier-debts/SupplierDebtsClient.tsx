"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function SupplierDebtsClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "product", label: t(language, "product") },
    { key: "totalAmount", label: t(language, "totalAmount"), type: "number" as const },
    { key: "paidAmount", label: t(language, "paidAmount"), type: "number" as const },
    { key: "remainingAmount", label: t(language, "remainingAmount"), type: "number" as const },
    {
      key: "status", label: t(language, "status"), type: "badge" as const,
      badgeMap: { paid: "badge-success", partial: "badge-warning", unpaid: "badge-danger" }
    },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "product", label: t(language, "product"), type: "text" as const },
    { key: "totalAmount", label: t(language, "totalAmount"), type: "number" as const },
    { key: "paidAmount", label: t(language, "paidAmount"), type: "number" as const },
    { key: "remainingAmount", label: t(language, "remainingAmount"), type: "number" as const, readOnly: true },
    { key: "status", label: t(language, "status"), type: "text" as const, readOnly: true },
  ];
  return (
    <PageWrapper
      title={`📦 ${t(language, "supplierDebts")}`}
      apiPath="supplier-debts"
      columns={columns}
      fields={fields}
      lang={lang} role={role}
      defaultValues={{ name: "", product: "", totalAmount: 0, paidAmount: 0, remainingAmount: 0, status: "unpaid" }}
      onBeforeSave={(data) => {
        const total = Number(data.totalAmount) || 0;
        const paid = Number(data.paidAmount) || 0;
        const remaining = total - paid;
        let status = "unpaid";
        if (paid > 0 && remaining <= 0) status = "paid";
        else if (paid > 0) status = "partial";
        return { ...data, remainingAmount: remaining, status };
      }}
    />
  );
}
