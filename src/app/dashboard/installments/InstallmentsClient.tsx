"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

interface Worker { id: number; name: string; }

export default function InstallmentsClient({ lang, role, workers }: { lang: string; role?: string; workers: Worker[] }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "workerName", label: t(language, "workerName") },
    { key: "nature", label: t(language, "installmentNature") },
    { key: "amount", label: t(language, "amount"), type: "number" as const },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    {
      key: "workerId", label: t(language, "selectWorker"), type: "select" as const,
      options: workers.map((w) => ({ value: String(w.id), label: w.name }))
    },
    { key: "workerName", label: t(language, "workerName"), type: "text" as const },
    { key: "nature", label: t(language, "installmentNature"), type: "text" as const },
    { key: "amount", label: t(language, "amount"), type: "number" as const },
  ];
  return (
    <PageWrapper
      title={`💵 ${t(language, "installments")}`}
      apiPath="installments"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ workerId: "", workerName: "", nature: "", amount: 0 }}
    />
  );
}
