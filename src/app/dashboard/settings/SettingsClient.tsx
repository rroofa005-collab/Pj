"use client";
import { useState, useEffect } from "react";
import { t, type Language } from "@/lib/i18n";
import Image from "next/image";

interface DeveloperInfo {
  name: string;
  photo: string;
  phone: string;
  facebook: string;
  instagram: string;
  youtube: string;
  info: string;
}

const defaultDevInfo: DeveloperInfo = {
  name: "Adouani Abderraouf",
  photo: "",
  phone: "",
  facebook: "",
  instagram: "",
  youtube: "",
  info: "",
};

export default function SettingsClient({ lang, role }: { lang: string; role: string }) {
  const [language, setLanguage] = useState(lang || "ar");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [devInfo, setDevInfo] = useState<DeveloperInfo>(defaultDevInfo);
  const [loadingDev, setLoadingDev] = useState(false);
  const [editingDev, setEditingDev] = useState(false);
  const typedLang = language as Language;
  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setLoadingDev(true);
      fetch("/api/settings")
        .then(r => r.json())
        .then(data => {
          if (data.developerInfo) {
            try {
              setDevInfo(JSON.parse(data.developerInfo));
            } catch { setDevInfo(defaultDevInfo); }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDev(false));
    }
  }, [isAdmin]);

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
    setTimeout(() => window.location.reload(), 500);
  }

  async function saveDevInfo() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "developerInfo", value: JSON.stringify(devInfo) }),
    });
    setSaving(false);
    setEditingDev(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ {t(typedLang, "settings")}</h1>
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {/* Language Settings - Always visible */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: "14px", color: "var(--primary)", fontSize: "0.95rem" }}>
            🌐 {t(typedLang, "language")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                  gap: "10px",
                  padding: "10px 14px",
                  border: `2px solid ${language === opt.value ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: language === opt.value ? "#eff6ff" : "white",
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
                <span style={{ fontSize: "1.3rem" }}>{opt.flag}</span>
                <span style={{ fontWeight: 600 }}>{opt.label}</span>
                {language === opt.value && <span style={{ marginInlineStart: "auto", color: "var(--accent)" }}>✓</span>}
              </label>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={saving}
            style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
          >
            {saving ? "..." : saved ? "✅ " + t(typedLang, "save") : t(typedLang, "save")}
          </button>
        </div>

        {/* Developer Info - Only visible to non-admins */}
        {!isAdmin && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.95rem" }}>
                👨‍💻 {language === "ar" ? "المطور" : language === "fr" ? "Développeur" : "Developer"}
              </h2>
            </div>
            
            {loadingDev ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>...</div>
            ) : devInfo.name || devInfo.photo || devInfo.info ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "10px 0" }}>
                {devInfo.photo && (
                  <Image
                    src={devInfo.photo}
                    alt={devInfo.name}
                    width={80}
                    height={80}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                )}
                {devInfo.name && (
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--primary)" }}>{devInfo.name}</div>
                )}
                {devInfo.phone && (
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>📞 {devInfo.phone}</div>
                )}
                {devInfo.info && (
                  <div style={{ fontSize: "0.85rem", color: "var(--text)", textAlign: "center" }}>{devInfo.info}</div>
                )}
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  {devInfo.facebook && <a href={devInfo.facebook} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.2rem" }}>📘</a>}
                  {devInfo.instagram && <a href={devInfo.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.2rem" }}>📸</a>}
                  {devInfo.youtube && <a href={devInfo.youtube} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.2rem" }}>📺</a>}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {language === "ar" ? "لا توجد معلومات للمطور" : language === "fr" ? "Pas d'info développeur" : "No developer info"}
              </div>
            )}
          </div>
        )}

        {/* Developer Settings - Only for Admin */}
        {isAdmin && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.95rem" }}>
                👨‍💻 {language === "ar" ? "إعدادات المطور" : language === "fr" ? "Paramètres développeur" : "Developer Settings"}
              </h2>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => { setEditingDev(!editingDev); setDevInfo(d => d.name ? d : defaultDevInfo); }}
              >
                {editingDev ? (language === "ar" ? "إلغاء" : "Annuler") : (language === "ar" ? "تعديل" : "Modifier")}
              </button>
            </div>
            
            {editingDev ? (
              <div style={{ display: "grid", gap: "10px" }}>
                <div>
                  <label className="form-label">{language === "ar" ? "الاسم" : "Name"}</label>
                  <input 
                    className="form-control" 
                    value={devInfo.name} 
                    onChange={e => setDevInfo({...devInfo, name: e.target.value})}
                    placeholder={language === "ar" ? "اسم المطور" : "Developer name"}
                  />
                </div>
                <div>
                  <label className="form-label">{language === "ar" ? "رابط الصورة" : "Photo URL"}</label>
                  <input 
                    className="form-control" 
                    value={devInfo.photo} 
                    onChange={e => setDevInfo({...devInfo, photo: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="form-label">{language === "ar" ? "رقم الهاتف" : "Phone"}</label>
                  <input 
                    className="form-control" 
                    value={devInfo.phone} 
                    onChange={e => setDevInfo({...devInfo, phone: e.target.value})}
                    placeholder="+213..."
                  />
                </div>
                <div>
                  <label className="form-label">{language === "ar" ? "رابط فيسبوك" : "Facebook URL"}</label>
                  <input 
                    className="form-control" 
                    value={devInfo.facebook} 
                    onChange={e => setDevInfo({...devInfo, facebook: e.target.value})}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="form-label">{language === "ar" ? "رابط إنستغرام" : "Instagram URL"}</label>
                  <input 
                    className="form-control" 
                    value={devInfo.instagram} 
                    onChange={e => setDevInfo({...devInfo, instagram: e.target.value})}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="form-label">{language === "ar" ? "رابط يوتيوب" : "YouTube URL"}</label>
                  <input 
                    className="form-control" 
                    value={devInfo.youtube} 
                    onChange={e => setDevInfo({...devInfo, youtube: e.target.value})}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <label className="form-label">{language === "ar" ? "معلومات إضافية" : "Additional Info"}</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={devInfo.info} 
                    onChange={e => setDevInfo({...devInfo, info: e.target.value})}
                    placeholder={language === "ar" ? "أي معلومات إضافية..." : "Any additional info..."}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={saveDevInfo}
                  disabled={saving}
                  style={{ justifyContent: "center" }}
                >
                  {saving ? "..." : t(typedLang, "save")}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {language === "ar" ? "اضغط تعديل لإضافة معلومات المطور" : "Cliquez sur modifier pour ajouter les infos"}
              </div>
            )}
          </div>
        )}

        {/* App Info */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: "14px", color: "var(--primary)", fontSize: "0.95rem" }}>
            ℹ️ {t(typedLang, "appName")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "10px 0" }}>
            <Image
              src="https://assets.kiloapps.io/user_dd4037cd-bc12-4818-a841-664202163b63/7ba274dd-eee4-4356-81ed-3609f94a4da8/1b601af4-0e53-4e3a-a63c-8b45dae62cb2.png"
              alt="R-Manager Pro"
              width={60}
              height={60}
              style={{ borderRadius: "10px" }}
            />
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--primary)" }}>R-Manager Pro</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Version 1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}