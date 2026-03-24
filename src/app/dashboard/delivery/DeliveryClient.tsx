"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function DeliveryClient({ lang }: { lang: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "amount", label: t(language, "amount"), type: "number" as const },
    { key: "note", label: t(language, "note") },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "amount", label: t(language, "amount"), type: "number" as const },
    { key: "note", label: t(language, "note"), type: "textarea" as const },
  ];
  return (
    <PageWrapper
      title={`🚚 ${t(language, "delivery")}`}
      apiPath="delivery"
      columns={columns}
      fields={fields}
      lang={lang}
      defaultValues={{ amount: 0, note: "" }}
    />
  );
}
