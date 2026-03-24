"use client";
import PageWrapper from "@/components/PageWrapper";
import { t, type Language } from "@/lib/i18n";

const WILAYAS = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة",
  "تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة",
  "سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة",
  "وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة",
  "سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تيموشنت","غرداية","غليزان","تيميمون",
  "برج باجي مختار","أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة"
];

export default function OrdersClient({ lang }: { lang: string }) {
  const language = (lang || "ar") as Language;
  const columns = [
    { key: "name", label: t(language, "name") },
    { key: "product", label: t(language, "product") },
    { key: "totalAmountNoDelivery", label: t(language, "totalAmount"), type: "number" as const },
    { key: "wilaya", label: t(language, "wilaya") },
    {
      key: "orderStatus", label: t(language, "orderStatus"), type: "badge" as const,
      badgeMap: { pending: "badge-warning", shipped: "badge-info", delivered: "badge-success", cancelled: "badge-danger" }
    },
    { key: "createdAt", label: t(language, "date"), type: "date" as const },
  ];
  const fields = [
    { key: "name", label: t(language, "name"), type: "text" as const },
    { key: "product", label: t(language, "product"), type: "text" as const },
    { key: "totalAmountNoDelivery", label: t(language, "totalAmount"), type: "number" as const },
    { key: "wilaya", label: t(language, "wilaya"), type: "select" as const, options: WILAYAS.map((w) => ({ value: w, label: w })) },
    {
      key: "orderStatus", label: t(language, "orderStatus"), type: "select" as const,
      options: [
        { value: "pending", label: t(language, "orderPending") },
        { value: "shipped", label: t(language, "orderShipped") },
        { value: "delivered", label: t(language, "orderDelivered") },
        { value: "cancelled", label: t(language, "orderCancelled") },
      ]
    },
  ];
  return (
    <PageWrapper
      title={`📋 ${t(language, "orders")}`}
      apiPath="orders"
      columns={columns}
      fields={fields}
      lang={lang}
      defaultValues={{ name: "", product: "", totalAmountNoDelivery: 0, wilaya: "", orderStatus: "pending" }}
    />
  );
}
