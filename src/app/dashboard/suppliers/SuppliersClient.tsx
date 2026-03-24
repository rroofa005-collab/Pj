"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function SuppliersClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "serviceType", label: t(language, "serviceType") },
    { key: "phone", label: t(language, "phone") },
    { key: "note", label: t(language, "note") },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "serviceType", label: t(language, "serviceType"), type: "text" as const },
    { key: "phone", label: t(language, "phone"), type: "text" as const },
    { key: "note", label: t(language, "note"), type: "textarea" as const },
  ];
  return (
    <PageWrapper
      title={`🏭 ${t(language, "suppliers")}`}
      apiPath="suppliers"
      columns={columns}
      fields={fields}
      lang={lang} role={role}
      defaultValues={{ name: "", serviceType: "", phone: "", note: "" }}
    />
  );
}
