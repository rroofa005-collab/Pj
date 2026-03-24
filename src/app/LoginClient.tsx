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
  const router = useRouter();
  const language = currentLang as Language;
  const dir = language === "ar" ? "rtl" : "ltr";

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
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "language", value: newLang }),
    });
  }

  return (
    <div
      dir={dir}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1f35 0%, #1e3a5f 50%, #0f1f35 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite 1s",
        }} />
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          animation: "pulse 6s ease-in-out infinite 0.5s",
        }} />
      </div>

      {/* Language Switcher */}
      <div style={{
        position: "absolute",
        top: "20px",
        right: dir === "rtl" ? "auto" : "20px",
        left: dir === "rtl" ? "20px" : "auto",
        zIndex: 10,
        display: "flex",
        gap: "8px",
        animation: "fadeIn 0.6s ease-out",
      }}>
        {[
          { code: "ar", flag: "🇩🇿", label: "عربي" },
          { code: "fr", flag: "🇫🇷", label: "Français" },
          { code: "en", flag: "🇬🇧", label: "English" },
        ].map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            style={{
              background: currentLang === lang.code 
                ? "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.15) 100%)" 
                : "rgba(255,255,255,0.08)",
              border: `1.5px solid ${currentLang === lang.code ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.15)"}`,
              color: "white",
              padding: "8px 16px",
              borderRadius: "25px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
              animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
            }}
            onMouseOver={(e) => {
              if (currentLang !== lang.code) {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseOut={(e) => {
              if (currentLang !== lang.code) {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{lang.flag}</span> 
            {lang.label}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 80px rgba(59,130,246,0.1)",
        position: "relative",
        zIndex: 1,
        animation: "scaleIn 0.5s ease-out",
      }}>
        {/* Glow Effect */}
        <div style={{
          position: "absolute",
          top: "-2px",
          left: "-2px",
          right: "-2px",
          bottom: "-2px",
          borderRadius: "26px",
          background: "linear-gradient(135deg, #3b82f6 0%, #1e3a5f 50%, #3b82f6 100%)",
          zIndex: -1,
          opacity: 0.3,
        }} />

        {/* Logo */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          marginBottom: "32px",
          animation: "fadeIn 0.6s ease-out 0.2s both",
        }}>
          <div style={{
            position: "relative",
            marginBottom: "16px",
          }}>
            <div style={{
              position: "absolute",
              inset: "-8px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(30,58,95,0.1) 100%)",
              animation: "pulse 3s ease-in-out infinite",
            }} />
            <Image
              src="https://assets.kiloapps.io/user_dd4037cd-bc12-4818-a841-664202163b63/7ba274dd-eee4-4356-81ed-3609f94a4da8/1b601af4-0e53-4e3a-a63c-8b45dae62cb2.png"
              alt="R-Manager Pro"
              width={100}
              height={100}
              style={{ 
                borderRadius: "16px", 
                position: "relative",
                boxShadow: "0 8px 24px rgba(30,58,95,0.25)",
              }}
            />
          </div>
          <h1 style={{ 
            fontSize: "1.8rem", 
            fontWeight: 800, 
            background: "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "6px",
            letterSpacing: "0.5px",
          }}>
            R-Manager Pro
          </h1>
          <p style={{ 
            fontSize: "0.9rem", 
            color: "#64748b",
            fontWeight: 500,
          }}>
            {language === "ar" ? "نظام إدارة الأعمال الذكي" : language === "fr" ? "Système de gestion intelligent" : "Smart Business Management System"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          animation: "fadeIn 0.6s ease-out 0.3s both",
        }}>
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label">{t(language, "username")}</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: dir === "rtl" ? "auto" : "14px",
                right: dir === "rtl" ? "14px" : "auto",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "1.1rem",
              }}>
                👤
              </span>
              <input
                className="form-control"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t(language, "username")}
                required
                autoFocus
                style={{
                  paddingLeft: dir === "rtl" ? "14px" : "44px",
                  paddingRight: dir === "rtl" ? "44px" : "14px",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  height: "48px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label className="form-label">{t(language, "password")}</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: dir === "rtl" ? "auto" : "14px",
                right: dir === "rtl" ? "14px" : "auto",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "1.1rem",
              }}>
                🔒
              </span>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t(language, "password")}
                required
                style={{
                  paddingLeft: dir === "rtl" ? "14px" : "44px",
                  paddingRight: dir === "rtl" ? "44px" : "14px",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  height: "48px",
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              color: "#991b1b",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "20px",
              textAlign: "center",
              border: "1px solid #fecaca",
              animation: "shake 0.5s ease-out",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              width: "100%", 
              justifyContent: "center", 
              padding: "14px", 
              fontSize: "1rem",
              height: "52px",
              borderRadius: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ 
                  width: "18px", 
                  height: "18px", 
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }} />
                جاري التحميل...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                🚀 {t(language, "loginBtn")}
              </span>
            )}
          </button>
        </form>

        <div style={{
          marginTop: "32px",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "20px",
          textAlign: "center",
          animation: "fadeIn 0.6s ease-out 0.5s both",
        }}>
          <p style={{ 
            fontSize: "0.8rem", 
            color: "#94a3b8",
            fontWeight: 500,
            letterSpacing: "0.5px",
          }}>
            Dev By <span style={{ color: "#1e3a5f", fontWeight: 700 }}>Adouani Abderraouf</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        textAlign: "center",
        animation: "fadeIn 0.6s ease-out 0.6s both",
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 500 }}>
          © 2024 R-Manager Pro. All rights reserved.
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
