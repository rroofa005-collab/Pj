"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

export default function PurchasedPhonesClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "phone", label: t(language, "phone") },
    { key: "phoneType", label: t(language, "phoneType") },
    { key: "phoneDetails", label: t(language, "phoneDetails") },
    { key: "serialNumber", label: t(language, "serialNumber") },
    { key: "phoneCondition", label: t(language, "phoneCondition") },
    { key: "purchaseAmount", label: t(language, "purchaseAmount"), type: "number" as const },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "phone", label: t(language, "phone"), type: "text" as const },
    { key: "phoneType", label: t(language, "phoneType"), type: "text" as const },
    { key: "phoneDetails", label: t(language, "phoneDetails"), type: "text" as const },
    { key: "serialNumber", label: t(language, "serialNumber"), type: "text" as const },
    { key: "phoneCondition", label: t(language, "phoneCondition"), type: "text" as const },
    { key: "purchaseAmount", label: t(language, "purchaseAmount"), type: "number" as const },
  ];
  return (
    <PageWrapper
      title={`📱 ${t(language, "purchasedPhones")}`}
      apiPath="purchased-phones"
      columns={columns}
      fields={fields}
      lang={lang}
      role={role}
      defaultValues={{ name: "", phone: "", phoneType: "", phoneDetails: "", serialNumber: "", phoneCondition: "", purchaseAmount: 0 }}
    />
  );
}
