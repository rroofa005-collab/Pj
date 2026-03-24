"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function ExpensesClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "type", label: t(language, "type") },
    { key: "amount", label: t(language, "amount"), type: "number" as const },
    { key: "note", label: t(language, "note") },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "type", label: t(language, "type"), type: "text" as const },
    { key: "amount", label: t(language, "amount"), type: "number" as const },
    { key: "note", label: t(language, "note"), type: "textarea" as const },
  ];
  return (
    <PageWrapper
      title={`💸 ${t(language, "expenses")}`}
      apiPath="expenses"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ type: "", amount: 0, note: "" }}
    />
  );
}