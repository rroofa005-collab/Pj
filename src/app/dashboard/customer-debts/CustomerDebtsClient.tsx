"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function CustomerDebtsClient({ lang }: { lang: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "phone", label: t(language, "phone") },
    { key: "serviceOrProduct", label: t(language, "serviceOrProduct") },
    { key: "totalAmount", label: t(language, "totalAmount"), type: "number" as const },
    { key: "paidAmount", label: t(language, "paidAmount"), type: "number" as const },
    { key: "remainingAmount", label: t(language, "remainingAmount"), type: "number" as const },
    { key: "dueDate", label: t(language, "dueDate") },
    { key: "note", label: t(language, "note") },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "phone", label: t(language, "phone"), type: "text" as const },
    { key: "serviceOrProduct", label: t(language, "serviceOrProduct"), type: "text" as const },
    { key: "totalAmount", label: t(language, "totalAmount"), type: "number" as const },
    { key: "paidAmount", label: t(language, "paidAmount"), type: "number" as const },
    { key: "remainingAmount", label: t(language, "remainingAmount"), type: "number" as const, readOnly: true },
    { key: "dueDate", label: t(language, "dueDate"), type: "date" as const },
    { key: "note", label: t(language, "note"), type: "textarea" as const },
  ];
  return (
    <PageWrapper
      title={`💳 ${t(language, "customerDebts")}`}
      apiPath="customer-debts"
      columns={columns}
      fields={fields}
      lang={lang}
      defaultValues={{ name: "", phone: "", serviceOrProduct: "", totalAmount: 0, paidAmount: 0, remainingAmount: 0, dueDate: "", note: "" }}
      onBeforeSave={(data) => ({
        ...data,
        remainingAmount: (Number(data.totalAmount) || 0) - (Number(data.paidAmount) || 0),
      })}
    />
  );
}
