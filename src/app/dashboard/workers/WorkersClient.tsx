"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function WorkersClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "phone", label: t(language, "phone") },
    { key: "salary", label: t(language, "salary"), type: "number" as const },
    { key: "isActive", label: t(language, "status"), type: "boolean" as const },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "phone", label: t(language, "phone"), type: "text" as const },
    { key: "salary", label: t(language, "salary"), type: "number" as const },
    { key: "isActive", label: t(language, "status"), type: "boolean" as const },
  ];
  return (
    <PageWrapper
      title={`👷 ${t(language, "workers")}`}
      apiPath="workers"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ name: "", phone: "", salary: 0, isActive: true }}
    />
  );
}