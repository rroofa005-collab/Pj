"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

interface Worker { id: number; name: string; salary: number; }

export default function SalariesClient({ lang, role, workers }: { lang: string; role?: string; workers: Worker[] }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "workerName", label: t(language, "workerName") },
    { key: "baseSalary", label: t(language, "baseSalary"), type: "number" as const },
    { key: "bonuses", label: t(language, "bonuses"), type: "number" as const },
    { key: "penalties", label: t(language, "penalties"), type: "number" as const },
    { key: "netSalary", label: t(language, "netSalary"), type: "number" as const },
    { key: "paymentDate", label: t(language, "paymentDate") },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    {
      key: "workerId", label: t(language, "selectWorker"), type: "select" as const,
      options: workers.map((w) => ({ value: String(w.id), label: w.name }))
    },
    { key: "workerName", label: t(language, "workerName"), type: "text" as const },
    { key: "baseSalary", label: t(language, "baseSalary"), type: "number" as const },
    { key: "bonuses", label: t(language, "bonuses"), type: "number" as const },
    { key: "penalties", label: t(language, "penalties"), type: "number" as const },
    { key: "netSalary", label: t(language, "netSalary"), type: "number" as const, readOnly: true },
    { key: "paymentDate", label: t(language, "paymentDate"), type: "date" as const },
  ];
  return (
    <PageWrapper
      title={`🏦 ${t(language, "salaries")}`}
      apiPath="salaries"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ workerId: "", workerName: "", baseSalary: 0, bonuses: 0, penalties: 0, netSalary: 0, paymentDate: "" }}
      onBeforeSave={(data) => ({
        ...data,
        netSalary: (Number(data.baseSalary) || 0) + (Number(data.bonuses) || 0) - (Number(data.penalties) || 0),
      })}
    />
  );
}
