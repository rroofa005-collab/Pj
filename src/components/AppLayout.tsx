"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { t, type Language } from "@/lib/i18n";

interface NavItem {
  key: string;
  icon: string;
  href: string;
}

const ALL_NAV: NavItem[] = [
  { key: "dashboard", icon: "📊", href: "/dashboard" },
  { key: "workers", icon: "👷", href: "/dashboard/workers" },
  { key: "suppliers", icon: "🏭", href: "/dashboard/suppliers" },
  { key: "customerDebts", icon: "💳", href: "/dashboard/customer-debts" },
  { key: "supplierDebts", icon: "📦", href: "/dashboard/supplier-debts" },
  { key: "expenses", icon: "💸", href: "/dashboard/expenses" },
  { key: "purchasedPhones", icon: "📱", href: "/dashboard/purchased-phones" },
  { key: "receivedAmounts", icon: "💰", href: "/dashboard/received-amounts" },
  { key: "maintenance", icon: "🔧", href: "/dashboard/maintenance" },
  { key: "maintenanceTracking", icon: "🔍", href: "/dashboard/maintenance-tracking" },
  { key: "electronicServices", icon: "⚡", href: "/dashboard/electronic-services" },
  { key: "orders", icon: "📋", href: "/dashboard/orders" },
  { key: "installments", icon: "💵", href: "/dashboard/installments" },
  { key: "salaries", icon: "🏦", href: "/dashboard/salaries" },
  { key: "treasury", icon: "🏛️", href: "/dashboard/treasury" },
  { key: "delivery", icon: "🚚", href: "/dashboard/delivery" },
  { key: "settings", icon: "⚙️", href: "/dashboard/settings" },
  { key: "admin", icon: "👥", href: "/dashboard/admin" },
];

interface AppLayoutProps {
  children: React.ReactNode;
  lang: string;
  role: string;
  permissions: string[];
  username: string;
}

export default function AppLayout({ children, lang, role, permissions, username }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const language = (lang || "ar") as Language;
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAdmin = role === "admin";

  const visibleNav = ALL_NAV.filter((item) => {
    if (item.key === "dashboard") return true;
    if (isAdmin) return true;
    // Non-admin can only see pages that have permissions
    const pageKey = item.href.replace("/dashboard/", "") || "dashboard";
    return permissions.includes(pageKey) || permissions.includes(item.key);
  });

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [dir, language]);

  return (
    <div dir={dir} style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Image
            src="https://assets.kiloapps.io/user_dd4037cd-bc12-4818-a841-664202163b63/7ba274dd-eee4-4356-81ed-3609f94a4da8/1b601af4-0e53-4e3a-a63c-8b45dae62cb2.png"
            alt="RM"
            width={36}
            height={36}
            style={{ borderRadius: "8px" }}
          />
          {!collapsed && (
            <span style={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>
              R-Manager Pro
            </span>
          )}
        </div>

        {/* User info */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>{isAdmin ? t(language, "roleAdmin") : t(language, "roleUser")}</div>
          <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{username}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {visibleNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                <span>{t(language, item.key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: "100%", background: "none", border: "none" }}
          >
            <span>🚪</span>
            <span>{t(language, "logout")}</span>
          </button>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", textAlign: "center", marginTop: "8px" }}>
            Dev By Adouani Abderraouf
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content" style={{ flex: 1, padding: "24px", background: "var(--bg)" }}>
        {children}
      </main>
    </div>
  );
}
