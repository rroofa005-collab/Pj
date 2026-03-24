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
  const router = useRouter();
  const language = (lang || "ar") as Language;
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
