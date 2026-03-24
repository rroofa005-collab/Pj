"use client";

import { useState, useEffect } from "react";
import { t, type Language } from "@/lib/i18n";

interface SummaryCard {
  titleKey: string;
  icon: string;
  color: string;
  apiPath: string;
  permKey: string;
  compute: (data: Record<string, unknown>[]) => string | number;
}

const ALL_SUMMARY_CARDS: SummaryCard[] = [
  {
    titleKey: "workers", icon: "👷", color: "#3b82f6",
    apiPath: "workers", permKey: "workers",
    compute: (d) => d.filter((w) => w.isActive).length + " / " + d.length,
  },
  {
    titleKey: "suppliers", icon: "🏭", color: "#0ea5e9",
    apiPath: "suppliers", permKey: "suppliers",
    compute: (d) => d.length + "",
  },
  {
    titleKey: "customerDebts", icon: "💳", color: "#ef4444",
    apiPath: "customer-debts", permKey: "customer-debts",
    compute: (d) => d.reduce((s, r) => s + (Number(r.remainingAmount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "supplierDebts", icon: "📦", color: "#f59e0b",
    apiPath: "supplier-debts", permKey: "supplier-debts",
    compute: (d) => d.reduce((s, r) => s + (Number(r.remainingAmount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "expenses", icon: "💸", color: "#8b5cf6",
    apiPath: "expenses", permKey: "expenses",
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "receivedAmounts", icon: "💰", color: "#10b981",
    apiPath: "received-amounts", permKey: "received-amounts",
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "maintenance", icon: "🔧", color: "#06b6d4",
    apiPath: "maintenance", permKey: "maintenance",
    compute: (d) => d.filter((r) => r.status === "in_maintenance").length + " / " + d.length,
  },
  {
    titleKey: "maintenanceTracking", icon: "🔍", color: "#0891b2",
    apiPath: "maintenance", permKey: "maintenance-tracking",
    compute: (d) => d.filter((r) => r.status === "done").length + " / " + d.length,
  },
  {
    titleKey: "purchasedPhones", icon: "📱", color: "#ec4899",
    apiPath: "purchased-phones", permKey: "purchased-phones",
    compute: (d) => d.reduce((s, r) => s + (Number(r.purchaseAmount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "orders", icon: "📋", color: "#f97316",
    apiPath: "orders", permKey: "orders",
    compute: (d) => d.filter((r) => r.orderStatus === "pending").length + " / " + d.length,
  },
  {
    titleKey: "electronicServices", icon: "⚡", color: "#6366f1",
    apiPath: "electronic-services", permKey: "electronic-services",
    compute: (d) => d.reduce((s, r) => s + (Number(r.amountDollar) || 0), 0).toLocaleString() + " $",
  },
  {
    titleKey: "installments", icon: "💵", color: "#a855f7",
    apiPath: "installments", permKey: "installments",
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "salaries", icon: "🏦", color: "#14b8a6",
    apiPath: "salaries", permKey: "salaries",
    compute: (d) => d.reduce((s, r) => s + (Number(r.netSalary) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "treasury", icon: "🏛️", color: "#1e4876",
    apiPath: "treasury", permKey: "treasury",
    compute: (d) => d.length > 0 ? (Number((d[d.length - 1] as Record<string, unknown>).actualBalance) || 0).toLocaleString() + " DA" : "—",
  },
  {
    titleKey: "delivery", icon: "🚚", color: "#84cc16",
    apiPath: "delivery", permKey: "delivery",
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
];

interface Props {
  lang: string;
  role: string;
  permissions: string[];
}

export default function DashboardClient({ lang, role, permissions }: Props) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);

  // Admin sees all cards; users see only their permitted cards
  const visibleCards = isAdmin
    ? ALL_SUMMARY_CARDS
    : ALL_SUMMARY_CARDS.filter((card) => permissions.includes(card.permKey));

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const results: Record<string, string | number> = {};
      // Only fetch APIs for visible cards (avoid duplicates by apiPath)
      const uniquePaths = [...new Set(visibleCards.map((c) => c.apiPath))];
      await Promise.all(
        uniquePaths.map(async (apiPath) => {
          try {
            const res = await fetch(`/api/${apiPath}`);
            const data = await res.json();
            if (Array.isArray(data)) {
              // Run each card's compute for this apiPath
              visibleCards
                .filter((c) => c.apiPath === apiPath)
                .forEach((card) => {
                  results[card.permKey] = card.compute(data);
                });
            }
          } catch {
            visibleCards
              .filter((c) => c.apiPath === apiPath)
              .forEach((card) => { results[card.permKey] = "—"; });
          }
        })
      );
      setValues(results);
      setLoading(false);
    }
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, permissions.join(",")]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 {t(language, "dashboard")}</h1>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {new Date().toLocaleDateString(
            language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US",
            { weekday: "long", year: "numeric", month: "long", day: "numeric" }
          )}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⏳</div>
          <p style={{ fontSize: "0.9rem" }}>
            {language === "ar" ? "جاري تحميل البيانات..." : language === "fr" ? "Chargement..." : "Loading..."}
          </p>
        </div>
      ) : visibleCards.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          color: "var(--text-muted)",
          background: "white", borderRadius: "14px",
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--primary-dark)" }}>
            {language === "ar" ? "لا توجد صلاحيات مخصصة لك بعد" : language === "fr" ? "Aucune permission assignée" : "No permissions assigned yet"}
          </p>
          <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
            {language === "ar" ? "تواصل مع المدير لإضافة الصلاحيات" : language === "fr" ? "Contactez l'administrateur" : "Contact your administrator"}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "16px",
        }}>
          {visibleCards.map((card) => (
            <div
              key={card.permKey}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 8px rgba(14,36,64,0.07)",
                borderTop: `4px solid ${card.color}`,
                transition: "transform 0.15s, box-shadow 0.15s",
                cursor: "default",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 18px rgba(14,36,64,0.12)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(14,36,64,0.07)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "0.75rem", color: "var(--text-muted)",
                    fontWeight: 600, marginBottom: "8px",
                    textTransform: "uppercase", letterSpacing: "0.4px",
                  }}>
                    {t(language, card.titleKey)}
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: card.color }}>
                    {values[card.permKey] ?? "—"}
                  </div>
                </div>
                <div style={{
                  fontSize: "1.8rem", opacity: 0.85,
                  background: `${card.color}18`,
                  borderRadius: "10px", padding: "6px",
                  lineHeight: 1,
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
