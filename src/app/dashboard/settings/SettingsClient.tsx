"use client";
import { useState } from "react";
import { t, type Language } from "@/lib/i18n";
import Image from "next/image";

export default function SettingsClient({ lang }: { lang: string }) {
  const [language, setLanguage] = useState(lang || "ar");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const typedLang = language as Language;

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "language", value: language }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Reload page to apply language
    setTimeout(() => window.location.reload(), 500);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ {t(typedLang, "settings")}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Language Settings */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: "16px", color: "var(--primary)", fontSize: "1rem" }}>
            🌐 {t(typedLang, "language")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { value: "ar", flag: "🇩🇿", label: "العربية" },
              { value: "fr", flag: "🇫🇷", label: "Français" },
              { value: "en", flag: "🇬🇧", label: "English" },
            ].map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  border: `2px solid ${language === opt.value ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: language === opt.value ? "#eff6ff" : "white",
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="language"
                  value={opt.value}
                  checked={language === opt.value}
                  onChange={() => setLanguage(opt.value)}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: "1.5rem" }}>{opt.flag}</span>
                <span style={{ fontWeight: 600 }}>{opt.label}</span>
                {language === opt.value && <span style={{ marginInlineStart: "auto", color: "var(--accent)" }}>✓</span>}
              </label>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={saving}
            style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}
          >
            {saving ? "..." : saved ? "✅ " + t(typedLang, "save") : t(typedLang, "save")}
          </button>
        </div>

        {/* App Info */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: "16px", color: "var(--primary)", fontSize: "1rem" }}>
            ℹ️ {t(typedLang, "appName")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
            <Image
              src="https://assets.kiloapps.io/user_dd4037cd-bc12-4818-a841-664202163b63/7ba274dd-eee4-4356-81ed-3609f94a4da8/1b601af4-0e53-4e3a-a63c-8b45dae62cb2.png"
              alt="R-Manager Pro"
              width={80}
              height={80}
              style={{ borderRadius: "12px" }}
            />
            <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--primary)" }}>R-Manager Pro</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Version 1.0.0</div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", width: "100%", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Developer</div>
              <div style={{ fontWeight: 600, color: "var(--primary)", marginTop: "4px" }}>Adouani Abderraouf</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
