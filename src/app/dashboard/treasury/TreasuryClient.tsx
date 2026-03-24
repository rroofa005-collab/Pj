"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function TreasuryClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
    { key: "openingBalance", label: t(language, "openingBalance"), type: "number" as const },
    { key: "programBalance", label: t(language, "programBalance"), type: "number" as const },
    { key: "actualBalance", label: t(language, "actualBalance"), type: "number" as const },
    { key: "expenses", label: t(language, "expenses"), type: "number" as const },
    { key: "purchases", label: t(language, "purchases"), type: "number" as const },
    { key: "customerDebts", label: t(language, "customerDebts"), type: "number" as const },
    { key: "receivedAmounts", label: t(language, "receivedAmounts"), type: "number" as const },
    { key: "wages", label: t(language, "wages"), type: "number" as const },
    { key: "installments", label: t(language, "installments"), type: "number" as const },
    { key: "flexi", label: t(language, "flexi"), type: "number" as const },
    { key: "maintenance", label: t(language, "maintenance"), type: "number" as const },
    { key: "note", label: t(language, "note") },
  ];
  const fields = [
    { key: "openingBalance", label: t(language, "openingBalance"), type: "number" as const },
    { key: "programBalance", label: t(language, "programBalance"), type: "number" as const },
    { key: "actualBalance", label: t(language, "actualBalance"), type: "number" as const },
    { key: "expenses", label: t(language, "expenses"), type: "number" as const },
    { key: "purchases", label: t(language, "purchases"), type: "number" as const },
    { key: "customerDebts", label: t(language, "customerDebts"), type: "number" as const },
    { key: "receivedAmounts", label: t(language, "receivedAmounts"), type: "number" as const },
    { key: "wages", label: t(language, "wages"), type: "number" as const },
    { key: "installments", label: t(language, "installments"), type: "number" as const },
    { key: "flexi", label: t(language, "flexi"), type: "number" as const },
    { key: "maintenance", label: t(language, "maintenance"), type: "number" as const },
    { key: "note", label: t(language, "note"), type: "textarea" as const },
  ];
  return (
    <PageWrapper
      title={`🏛️ ${t(language, "treasury")}`}
      apiPath="treasury"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ openingBalance: 0, programBalance: 0, actualBalance: 0, expenses: 0, purchases: 0, customerDebts: 0, receivedAmounts: 0, wages: 0, installments: 0, flexi: 0, maintenance: 0, note: "" }}
    />
  );
}
