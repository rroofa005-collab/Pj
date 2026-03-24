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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const language = (lang || "ar") as Language;
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAdmin = role === "admin";

  const visibleNav = ALL_NAV.filter((item) => {
    if (item.key === "dashboard") return true;
    if (isAdmin) return true;
    const pageKey = item.href.replace("/dashboard/", "") || "dashboard";
    return permissions.includes(pageKey) || permissions.includes(item.key);
  });

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  function handleNavClick() {
    setSidebarOpen(false);
  }

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [dir, language]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div dir={dir} style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
            display: "block",
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside 
        className="sidebar"
        style={{
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : undefined,
          position: "fixed",
          top: 0,
          zIndex: 50,
          height: "100vh",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Image
            src="https://assets.kiloapps.io/user_dd4037cd-bc12-4818-a841-664202163b63/7ba274dd-eee4-4356-81ed-3609f94a4da8/1b601af4-0e53-4e3a-a63c-8b45dae62cb2.png"
            alt="RM"
            width={36}
            height={36}
            style={{ borderRadius: "8px" }}
          />
          <span style={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>
            R-Manager Pro
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              marginInlineStart: "auto",
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ×
          </button>
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
                onClick={handleNavClick}
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
      <main 
        className="main-content" 
        style={{ 
          flex: 1, 
          padding: "16px", 
          background: "var(--bg)",
          marginInlineStart: 0,
        }}
      >
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            [dir === "rtl" ? "left" : "right"]: "20px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--primary)",
            color: "white",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            fontSize: "1.5rem",
            cursor: "pointer",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ☰
        </button>
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar {
            width: 280px !important;
          }
          [dir="rtl"] .sidebar {
            transform: translateX(100%);
          }
          [dir="ltr"] .sidebar {
            transform: translateX(-100%);
          }
          .sidebar:not([style*="transform"]) {
            transform: translateX(-100%) !important;
          }
          .main-content {
            margin-inlineStart: 0 !important;
            padding: 12px !important;
          }
          .data-table {
            font-size: 0.75rem !important;
          }
          .data-table th, .data-table td {
            padding: 6px 8px !important;
          }
          .card {
            padding: 12px !important;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px !important;
          }
          .page-title {
            font-size: 1.1rem !important;
          }
          .btn {
            padding: 6px 10px !important;
            font-size: 0.8rem !important;
          }
          .modal-box {
            padding: 16px !important;
            margin: 8px !important;
          }
          .form-control {
            padding: 6px 8px !important;
            font-size: 0.85rem !important;
          }
        }
        @media (max-width: 480px) {
          .sidebar {
            width: 260px !important;
          }
          .stat-card {
            padding: 10px 12px !important;
          }
          .stat-card .stat-value {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  );
}