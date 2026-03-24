"use client";

import { useState, useEffect } from "react";
import { t, type Language } from "@/lib/i18n";

interface SummaryCard {
  titleKey: string;
  icon: string;
  value: string | number;
  color: string;
  apiPath: string;
  compute: (data: Record<string, unknown>[]) => string | number;
}

const summaryCards: SummaryCard[] = [
  {
    titleKey: "workers", icon: "👷", color: "#3b82f6",
    apiPath: "workers", value: 0,
    compute: (d) => d.filter((w) => w.isActive).length + " / " + d.length,
  },
  {
    titleKey: "customerDebts", icon: "💳", color: "#ef4444",
    apiPath: "customer-debts", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.remainingAmount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "supplierDebts", icon: "📦", color: "#f59e0b",
    apiPath: "supplier-debts", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.remainingAmount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "expenses", icon: "💸", color: "#8b5cf6",
    apiPath: "expenses", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "receivedAmounts", icon: "💰", color: "#10b981",
    apiPath: "received-amounts", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "maintenance", icon: "🔧", color: "#06b6d4",
    apiPath: "maintenance", value: 0,
    compute: (d) => d.filter((r) => r.status === "in_maintenance").length + " / " + d.length,
  },
  {
    titleKey: "purchasedPhones", icon: "📱", color: "#ec4899",
    apiPath: "purchased-phones", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.purchaseAmount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "orders", icon: "📋", color: "#f97316",
    apiPath: "orders", value: 0,
    compute: (d) => d.filter((r) => r.orderStatus === "pending").length + " pending",
  },
  {
    titleKey: "electronicServices", icon: "⚡", color: "#6366f1",
    apiPath: "electronic-services", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.amountDollar) || 0), 0).toLocaleString() + " $",
  },
  {
    titleKey: "salaries", icon: "🏦", color: "#14b8a6",
    apiPath: "salaries", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.netSalary) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "installments", icon: "💵", color: "#a855f7",
    apiPath: "installments", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
  {
    titleKey: "delivery", icon: "🚚", color: "#84cc16",
    apiPath: "delivery", value: 0,
    compute: (d) => d.reduce((s, r) => s + (Number(r.amount) || 0), 0).toLocaleString() + " DA",
  },
];

interface Props {
  lang: string;
  role: string;
}

export default function DashboardClient({ lang }: Props) {
  const language = (lang || "ar") as Language;
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const results: Record<string, string | number> = {};
      await Promise.all(
        summaryCards.map(async (card) => {
          try {
            const res = await fetch(`/api/${card.apiPath}`);
            const data = await res.json();
            if (Array.isArray(data)) {
              results[card.apiPath] = card.compute(data);
            }
          } catch { results[card.apiPath] = "—"; }
        })
      );
      setValues(results);
      setLoading(false);
    }
    loadAll();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 {t(language, "dashboard")}</h1>
        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {new Date().toLocaleDateString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          })}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
          <p>Loading...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {summaryCards.map((card) => (
            <div
              key={card.apiPath}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderTop: `4px solid ${card.color}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500, marginBottom: "6px" }}>
                    {t(language, card.titleKey)}
                  </div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color: card.color }}>
                    {values[card.apiPath] ?? "—"}
                  </div>
                </div>
                <div style={{ fontSize: "2rem", opacity: 0.8 }}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
