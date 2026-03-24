"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface FeedbackItem {
  text: string;
  date: string;
  userRole: string;
  username?: string;
}

export default function SettingsClient({ lang, role }: { lang: string; role: string }) {
  const router = useRouter();
  const [language, setLanguage] = useState(lang || "ar");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [devInfo, setDevInfo] = useState<DeveloperInfo>(defaultDevInfo);
  const [loadingDev, setLoadingDev] = useState(false);
  const [editingDev, setEditingDev] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const typedLang = language as Language;
  const isAdmin = role === "admin";
  const dir = language === "ar" ? "rtl" : "ltr";

  // Update full page direction and language immediately when selection changes
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [dir, language]);

  useEffect(() => {
    if (!isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (isAdmin) {
      setLoadingFeedback(true);
      fetch("/api/settings")
        .then(r => r.json())
        .then(data => {
          if (data.feedback) {
            try {
              const parsed = JSON.parse(data.feedback);
              setFeedbackList(Array.isArray(parsed) ? parsed.reverse() : []);
            } catch { setFeedbackList([]); }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingFeedback(false));
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
    // Refresh server components so sidebar and all layout components use the new language
    router.refresh();
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

  async function sendFeedback() {
    if (!feedbackText.trim()) return;
    setSendingFeedback(true);
    // Save feedback to settings (admin can view it)
    const currentFeedback = await fetch("/api/settings").then(r => r.json()).then(d => d.feedback || "[]");
    let feedbackArray = [];
    try { feedbackArray = JSON.parse(currentFeedback); } catch { feedbackArray = []; }
    feedbackArray.push({
      text: feedbackText,
      date: new Date().toISOString(),
      userRole: role,
    });
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "feedback", value: JSON.stringify(feedbackArray) }),
    });
    setSendingFeedback(false);
    setFeedbackSent(true);
    setFeedbackText("");
    setTimeout(() => setFeedbackSent(false), 3000);
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

        {/* Feedback Section - Visible to all users */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: "14px", color: "var(--primary)", fontSize: "0.95rem" }}>
            💬 {language === "ar" ? "إرسال ملاحظة" : language === "fr" ? "Envoyer une note" : "Send Feedback"}
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            {language === "ar" ? "قدم اقتراحاتك أو أبلغ عن مشاكل في التطبيق" : language === "fr" ? "Faites vos suggestions ou signalez des problèmes" : "Make suggestions or report issues"}
          </p>
          <textarea
            className="form-control"
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={language === "ar" ? "اكتب ملاحظتك هنا..." : language === "fr" ? "Écrivez votre note ici..." : "Write your feedback here..."}
            style={{ marginBottom: "10px" }}
          />
          <button
            className="btn btn-primary"
            onClick={sendFeedback}
            disabled={sendingFeedback || !feedbackText.trim()}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {sendingFeedback ? "..." : feedbackSent ? "✅ " + (language === "ar" ? "تم الإرسال" : language === "fr" ? "Envoyé" : "Sent") : "🚀 " + (language === "ar" ? "إرسال" : language === "fr" ? "Envoyer" : "Send")}
          </button>
        </div>

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

        {/* Feedback List - Only for Admin */}
        {isAdmin && (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: "14px", color: "var(--primary)", fontSize: "0.95rem" }}>
              💬 {language === "ar" ? "الملاحظات الواردة" : language === "fr" ? "Retours reçus" : "Received Feedback"}
              {feedbackList.length > 0 && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--accent)",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  marginInlineStart: "8px",
                }}>
                  {feedbackList.length}
                </span>
              )}
            </h2>
            {loadingFeedback ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>...</div>
            ) : feedbackList.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", padding: "20px" }}>
                {language === "ar" ? "لا توجد ملاحظات بعد" : language === "fr" ? "Aucun retour pour l'instant" : "No feedback yet"}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {feedbackList.map((item, i) => (
                  <div key={i} style={{
                    background: "#f8fafc",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{
                        background: item.userRole === "admin" ? "#dbeafe" : "#dcfce7",
                        color: item.userRole === "admin" ? "#1e40af" : "#166534",
                        borderRadius: "12px",
                        padding: "2px 10px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}>
                        {item.userRole === "admin"
                          ? (language === "ar" ? "أدمن" : "Admin")
                          : (language === "ar" ? "مستخدم" : language === "fr" ? "Utilisateur" : "User")}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {new Date(item.date).toLocaleDateString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: "1.5" }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Access Control - Only for Admin */}
        {isAdmin && (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: "14px", color: "var(--primary)", fontSize: "0.95rem" }}>
              🔐 {t(typedLang, "accessControl")}
            </h2>
            <AccessControlSettings language={language} />
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

interface AccessControlSettingsProps {
  language: string;
}

function AccessControlSettings({ language }: AccessControlSettingsProps) {
  const [allowedDays, setAllowedDays] = useState<string[]>([]);
  const [timeStart, setTimeStart] = useState("00:00");
  const [timeEnd, setTimeEnd] = useState("23:59");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const days = [
    { value: "0", label: language === "ar" ? "الأحد" : language === "fr" ? "Dimanche" : "Sunday" },
    { value: "1", label: language === "ar" ? "الاثنين" : language === "fr" ? "Lundi" : "Monday" },
    { value: "2", label: language === "ar" ? "الثلاثاء" : language === "fr" ? "Mardi" : "Tuesday" },
    { value: "3", label: language === "ar" ? "الأربعاء" : language === "fr" ? "Mercredi" : "Wednesday" },
    { value: "4", label: language === "ar" ? "الخميس" : language === "fr" ? "Jeudi" : "Thursday" },
    { value: "5", label: language === "ar" ? "الجمعة" : language === "fr" ? "Vendredi" : "Friday" },
    { value: "6", label: language === "ar" ? "السبت" : language === "fr" ? "Samedi" : "Saturday" },
  ];

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.accessControl) {
          try {
            const parsed = JSON.parse(data.accessControl);
            if (parsed.days) setAllowedDays(parsed.days);
            if (parsed.timeStart) setTimeStart(parsed.timeStart);
            if (parsed.timeEnd) setTimeEnd(parsed.timeEnd);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(day: string) {
    if (allowedDays.includes(day)) {
      setAllowedDays(allowedDays.filter(d => d !== day));
    } else {
      setAllowedDays([...allowedDays, day]);
    }
  }

  async function saveAccessControl() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "accessControl",
        value: JSON.stringify({ days: allowedDays, timeStart, timeEnd })
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isAllDaysSelected = days.length === allowedDays.length;

  if (loading) {
    return <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>...</div>;
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div>
        <label style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px", display: "block" }}>
          {language === "ar" ? "الأيام المسموح بها" : language === "fr" ? "Jours autorisés" : "Allowed Days"}
        </label>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {days.map(day => (
            <button
              key={day.value}
              onClick={() => toggleDay(day.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: `2px solid ${allowedDays.includes(day.value) ? "var(--accent)" : "var(--border)"}`,
                background: allowedDays.includes(day.value) ? "#eff6ff" : "white",
                color: allowedDays.includes(day.value) ? "var(--accent)" : "var(--text)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {day.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => isAllDaysSelected ? setAllowedDays([]) : setAllowedDays(days.map(d => d.value))}
          style={{
            marginTop: "8px",
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.8rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isAllDaysSelected 
            ? (language === "ar" ? "إلغاء الكل" : language === "fr" ? "Tout désélectionner" : "Deselect All")
            : (language === "ar" ? "اختيار الكل" : language === "fr" ? "Tout sélectionner" : "Select All")
          }
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label className="form-label">{language === "ar" ? "وقت البدء" : language === "fr" ? "Heure de début" : "Start Time"}</label>
          <input
            className="form-control"
            type="time"
            value={timeStart}
            onChange={e => setTimeStart(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">{language === "ar" ? "وقت الانتهاء" : language === "fr" ? "Heure de fin" : "End Time"}</label>
          <input
            className="form-control"
            type="time"
            value={timeEnd}
            onChange={e => setTimeEnd(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={saveAccessControl}
        disabled={saving}
        style={{ justifyContent: "center" }}
      >
        {saving ? "..." : saved ? "✅" : t(language as Language, "save")}
      </button>

      {allowedDays.length === 0 && (
        <div style={{ 
          padding: "10px", 
          background: "#fef3c7", 
          borderRadius: "8px", 
          fontSize: "0.8rem",
          color: "#92400e"
        }}>
          ⚠️ {language === "ar" ? "لم يتم اختيار أي أيام - التطبيق متاح دائماً" : language === "fr" ? "Aucun jour sélectionné - l'application est toujours disponible" : "No days selected - app is always available"}
        </div>
      )}
    </div>
  );
}