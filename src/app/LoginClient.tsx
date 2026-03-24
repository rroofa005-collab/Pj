"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { t, type Language } from "@/lib/i18n";

interface Props {
  lang: string;
}

export default function LoginClient({ lang }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState(lang || "ar");
  const [showLangModal, setShowLangModal] = useState(false);
  const router = useRouter();
  const language = currentLang as Language;
  const dir = language === "ar" ? "rtl" : "ltr";

  const langs = [
    { code: "ar", flag: "🇩🇿", label: "العربية", sub: "Arabic" },
    { code: "fr", flag: "🇫🇷", label: "Français", sub: "French" },
    { code: "en", flag: "🇬🇧", label: "English", sub: "English" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setError(t(language, data.error) || t(language, "invalidCredentials"));
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(t(language, "invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  async function changeLanguage(newLang: string) {
    setCurrentLang(newLang);
    setShowLangModal(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "language", value: newLang }),
    });
  }

  const currentLangObj = langs.find(l => l.code === currentLang) || langs[0];

  return (
    <div
      dir={dir}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f1f35 50%, #1e3a5f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59,130,246,0.1) 0%, transparent 50%)",
      }} />

      {/* Language Button - top corner */}
      <button
        onClick={() => setShowLangModal(true)}
        style={{
          position: "absolute",
          top: "16px",
          right: dir === "rtl" ? "auto" : "16px",
          left: dir === "rtl" ? "16px" : "auto",
          zIndex: 10,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "white",
          padding: "8px 14px",
          borderRadius: "20px",
          cursor: "pointer",
          fontSize: "0.82rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backdropFilter: "blur(8px)",
          transition: "all 0.2s",
        }}
        onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
        onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
      >
        <span style={{ fontSize: "1.1rem" }}>{currentLangObj.flag}</span>
        {currentLangObj.label}
        <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>▼</span>
      </button>

      {/* Language Modal */}
      {showLangModal && (
        <div
          onClick={() => setShowLangModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "24px",
              width: "100%",
              maxWidth: "320px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{
              textAlign: "center",
              marginBottom: "20px",
            }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>🌐</div>
              <h3 style={{ fontWeight: 800, color: "#1e3a5f", fontSize: "1.1rem" }}>
                {language === "ar" ? "اختر اللغة" : language === "fr" ? "Choisir la langue" : "Choose Language"}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    border: `2px solid ${currentLang === l.code ? "#3b82f6" : "#e2e8f0"}`,
                    borderRadius: "12px",
                    background: currentLang === l.code ? "#eff6ff" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    width: "100%",
                    textAlign: "start",
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{l.flag}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e3a5f", fontSize: "0.95rem" }}>{l.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{l.sub}</div>
                  </div>
                  {currentLang === l.code && (
                    <span style={{ marginInlineStart: "auto", color: "#3b82f6", fontWeight: 700, fontSize: "1.1rem" }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLangModal(false)}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "10px",
                background: "#f1f5f9",
                color: "#64748b",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {language === "ar" ? "إغلاق" : language === "fr" ? "Fermer" : "Close"}
            </button>
          </div>
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: "20px",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
          <Image
            src="https://assets.kiloapps.io/user_dd4037cd-bc12-4818-a841-664202163b63/7ba274dd-eee4-4356-81ed-3609f94a4da8/1b601af4-0e53-4e3a-a63c-8b45dae62cb2.png"
            alt="R-Manager Pro"
            width={90}
            height={90}
            style={{ borderRadius: "12px", marginBottom: "12px" }}
          />
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1e3a5f", marginBottom: "4px" }}>
            R-Manager Pro
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            {language === "ar" ? "نظام إدارة الأعمال" : language === "fr" ? "Système de gestion" : "Business Management System"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label className="form-label">{t(language, "username")}</label>
            <input
              className="form-control"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t(language, "username")}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="form-label">{t(language, "password")}</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t(language, "password")}
              required
            />
          </div>

          {error && (
            <div style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "16px",
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "1rem" }}
          >
            {loading ? "..." : t(language, "loginBtn")}
          </button>
        </form>

        <div style={{
          marginTop: "28px",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "16px",
          textAlign: "center",
          fontSize: "0.78rem",
          color: "#94a3b8",
        }}>
          Dev By Adouani Abderraouf
        </div>
      </div>
    </div>
  );
}
