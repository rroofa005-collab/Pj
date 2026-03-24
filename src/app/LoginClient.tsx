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
    <>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(25px, -40px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 40px) scale(1.1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card {
          animation: fadeUp 0.6s ease forwards;
        }
        .login-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(138,168,200,0.35);
          background: rgba(13,31,53,0.45);
          color: #e8f0f8;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
          box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(138,168,200,0.55); }
        .login-input:focus {
          border-color: rgba(138,168,200,0.75);
          background: rgba(13,31,53,0.6);
          box-shadow: 0 0 0 3px rgba(43,96,176,0.25);
        }
        .login-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(197,212,227,0.9);
        }
        .login-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #c5d4e3 0%, #8aa8c8 50%, #c5d4e3 100%);
          color: #0d1f35;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 18px rgba(0,0,0,0.35);
          letter-spacing: 0.3px;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #dde8f2 0%, #a8c4dc 50%, #dde8f2 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(0,0,0,0.4);
        }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .lang-btn {
          position: absolute;
          top: 20px;
          z-index: 10;
          background: rgba(13,31,53,0.5);
          border: 1px solid rgba(138,168,200,0.35);
          color: #c5d4e3;
          padding: 8px 14px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .lang-btn:hover { background: rgba(13,31,53,0.7); }
      `}</style>

      <div
        dir={dir}
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0a1628 0%, #0d1f35 20%, #162d4a 45%, #1e4876 70%, #2b5f8e 90%, #0d1f35 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated blobs */}
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "rgba(30,72,118,0.6)",
          filter: "blur(80px)",
          animation: "float1 12s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "rgba(43,95,142,0.5)",
          filter: "blur(90px)",
          animation: "float2 15s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "40%",
          width: "350px", height: "350px", borderRadius: "50%",
          background: "rgba(138,168,200,0.2)",
          filter: "blur(70px)",
          animation: "float3 10s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Language Button */}
        <button
          className="lang-btn"
          style={{ [dir === "rtl" ? "left" : "right"]: "20px" }}
          onClick={() => setShowLangModal(true)}
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
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.55)", zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: "white", borderRadius: "20px",
                padding: "28px", width: "100%", maxWidth: "320px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🌐</div>
                <h3 style={{ fontWeight: 800, color: "#1e4876", fontSize: "1.1rem" }}>
                  {language === "ar" ? "اختر اللغة" : language === "fr" ? "Choisir la langue" : "Choose Language"}
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {langs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 16px",
                      border: `2px solid ${currentLang === l.code ? "#1e4876" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      background: currentLang === l.code ? "#e8f0f8" : "white",
                      cursor: "pointer", transition: "all 0.2s",
                      width: "100%", textAlign: "start",
                    }}
                  >
                    <span style={{ fontSize: "1.8rem" }}>{l.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0d1f35", fontSize: "0.95rem" }}>{l.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{l.sub}</div>
                    </div>
                    {currentLang === l.code && (
                      <span style={{ marginInlineStart: "auto", color: "#1e4876", fontWeight: 700, fontSize: "1.1rem" }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                style={{
                  marginTop: "16px", width: "100%", padding: "10px",
                  border: "none", borderRadius: "10px",
                  background: "#f1f5f9", color: "#64748b",
                  fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                }}
              >
                {language === "ar" ? "إغلاق" : language === "fr" ? "Fermer" : "Close"}
              </button>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div
          className="login-card"
          style={{
            background: "rgba(11,24,42,0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "24px",
            padding: "44px 40px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(138,168,200,0.2)",
            border: "1.5px solid rgba(138,168,200,0.2)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <div style={{
              background: "rgba(30,72,118,0.4)",
              borderRadius: "20px",
              padding: "10px",
              marginBottom: "14px",
              border: "2px solid rgba(138,168,200,0.35)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              <Image
                src="https://assets.kiloapps.io/user_dd4037cd-bc12-4818-a841-664202163b63/7ba274dd-eee4-4356-81ed-3609f94a4da8/1b601af4-0e53-4e3a-a63c-8b45dae62cb2.png"
                alt="R-Manager Pro"
                width={70}
                height={70}
                style={{ borderRadius: "10px", display: "block" }}
              />
            </div>
            <h1 style={{
              fontSize: "1.7rem", fontWeight: 900,
              color: "#e8f0f8", marginBottom: "6px",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              letterSpacing: "-0.3px",
            }}>
              R-Manager Pro
            </h1>
            <p style={{
              fontSize: "0.85rem",
              color: "rgba(138,168,200,0.9)",
              fontWeight: 500,
            }}>
              {language === "ar" ? "نظام إدارة الأعمال" : language === "fr" ? "Système de gestion" : "Business Management System"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label className="login-label">{t(language, "username")}</label>
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t(language, "username")}
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="login-label">{t(language, "password")}</label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t(language, "password")}
                required
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.45)",
                color: "#fca5a5",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                marginBottom: "18px",
                textAlign: "center",
                backdropFilter: "blur(4px)",
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "⏳" : t(language, "loginBtn")}
            </button>
          </form>

          <div style={{
            marginTop: "28px",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "rgba(138,168,200,0.45)",
            fontWeight: 500,
          }}>
            Dev By Adouani Abderraouf
          </div>
        </div>
      </div>
    </>
  );
}
