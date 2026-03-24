"use client";
import { useState, useEffect, useCallback } from "react";
import { t, type Language } from "@/lib/i18n";

interface AttendanceRecord {
  id: number;
  userId: number;
  username: string;
  workerName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  date: string | null;
  note: string | null;
}

interface Props {
  lang: string;
  role: string;
  userId: number;
  username: string;
}

function formatTime(ts: string | null) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ts; }
}
function formatDate(ts: string | null) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleDateString(); } catch { return ts ?? "—"; }
}

export default function AttendanceClient({ lang, role, userId }: Props) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [exportModal, setExportModal] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "word">("csv");

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    fetch(`/api/attendance?${params}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRecords(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, fromDate, toDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter(r => r.date === today && r.userId === userId);
  const openRecord = todayRecords.find(r => !r.checkOut);

  async function handleCheckIn() {
    setActionLoading(true);
    await fetch("/api/attendance", { method: "POST" });
    fetchData();
    setActionLoading(false);
  }

  async function handleCheckOut() {
    if (!openRecord) return;
    setActionLoading(true);
    await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: openRecord.id }),
    });
    fetchData();
    setActionLoading(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/attendance?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchData();
  }

  function exportData(format: "csv" | "pdf" | "word", from: string, to: string) {
    const filtered = records.filter(r => {
      if (from && r.date && r.date < from) return false;
      if (to && r.date && r.date > to) return false;
      return true;
    });
    if (filtered.length === 0) return;

    const headers = [
      language === "ar" ? "المستخدم" : "Username",
      language === "ar" ? "الموظف" : "Worker",
      language === "ar" ? "التاريخ" : "Date",
      language === "ar" ? "وقت الحضور" : "Check In",
      language === "ar" ? "وقت المغادرة" : "Check Out",
      language === "ar" ? "ساعات العمل" : "Work Hours",
    ];
    const rows = filtered.map(r => [
      r.username || "",
      r.workerName || "",
      r.date || "",
      formatTime(r.checkIn),
      formatTime(r.checkOut),
      r.workHours != null ? String(r.workHours) : "",
    ]);

    if (format === "csv") {
      const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `attendance-${today}.csv`);
    } else if (format === "word") {
      const html = `
        <html><head><meta charset="utf-8">
        <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:8px;text-align:center}th{background:#1e4876;color:white}</style>
        </head><body dir="${language === "ar" ? "rtl" : "ltr"}">
        <h2 style="color:#1e4876">${language === "ar" ? "سجل الحضور" : "Attendance Report"}</h2>
        <p>${from ? `${language === "ar" ? "من" : "From"}: ${from}` : ""} ${to ? `${language === "ar" ? "إلى" : "To"}: ${to}` : ""}</p>
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></body></html>`;
      const blob = new Blob([html], { type: "application/msword" });
      downloadBlob(blob, `attendance-${today}.doc`);
    } else if (format === "pdf") {
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`
        <html><head><meta charset="utf-8"><title>Attendance</title>
        <style>
          body{font-family:Arial,sans-serif;direction:${language === "ar" ? "rtl" : "ltr"};margin:20px}
          h2{color:#1e4876}
          table{border-collapse:collapse;width:100%;margin-top:16px}
          th{background:#1e4876;color:white;padding:8px;border:1px solid #ccc}
          td{padding:7px 8px;border:1px solid #ccc;text-align:center}
          tr:nth-child(even) td{background:#f2f7fc}
        </style></head>
        <body>
        <h2>${language === "ar" ? "سجل الحضور" : "Attendance Report"}</h2>
        <p>${from ? `${language === "ar" ? "من" : "From"}: ${from}` : ""} ${to ? ` — ${language === "ar" ? "إلى" : "To"}: ${to}` : ""}</p>
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
        <script>window.onload=function(){window.print();window.close()}</script>
        </body></html>`);
      win.document.close();
    }
    setExportModal(false);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const lbl = (ar: string, fr: string, en: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">📅 {lbl("الحضور والمغادرة", "Présences", "Attendance")}</h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {isAdmin && (
            <button className="btn btn-success btn-sm" onClick={() => setExportModal(true)}>
              📥 {t(language, "export")}
            </button>
          )}
        </div>
      </div>

      {/* ── User: Check In / Check Out ── */}
      {!isAdmin && (
        <div className="card" style={{ marginBottom: "16px", padding: "24px" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "6px", color: "var(--primary-dark)", fontSize: "0.95rem" }}>
            {lbl("حضورك اليوم", "Votre présence aujourd'hui", "Your attendance today")}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "20px" }}>
            {new Date().toLocaleDateString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>

          {openRecord ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 24px", borderRadius: "20px", fontWeight: 700, fontSize: "0.9rem" }}>
                ✅ {lbl("حضرت الساعة", "Arrivé à", "Checked in at")} {formatTime(openRecord.checkIn)}
              </div>
              <button
                className="btn btn-danger"
                disabled={actionLoading}
                onClick={handleCheckOut}
                style={{ padding: "14px 48px", fontSize: "1.1rem", fontWeight: 800, borderRadius: "14px" }}
              >
                🚪 {lbl("مغادرة", "Départ", "Check Out")}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              {todayRecords.length > 0 && (
                <div style={{ background: "#dbeafe", color: "#1e40af", padding: "10px 24px", borderRadius: "20px", fontWeight: 700, fontSize: "0.9rem" }}>
                  ✅ {lbl("أنهيت يوم عملك", "Journée terminée", "Work day complete")} — {String(todayRecords[todayRecords.length - 1]?.workHours ?? 0)} {lbl("ساعة", "h", "hrs")}
                </div>
              )}
              <button
                className="btn btn-primary"
                disabled={actionLoading}
                onClick={handleCheckIn}
                style={{ padding: "14px 48px", fontSize: "1.1rem", fontWeight: 800, borderRadius: "14px" }}
              >
                ✅ {lbl("تسجيل حضور", "Pointer", "Check In")}
              </button>
            </div>
          )}

          {/* User's own history */}
          {records.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "10px", color: "var(--primary)", fontSize: "0.85rem" }}>
                {lbl("سجل حضوري", "Mon historique", "My History")}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{lbl("التاريخ", "Date", "Date")}</th>
                      <th>{lbl("وقت الحضور", "Arrivée", "Check In")}</th>
                      <th>{lbl("وقت المغادرة", "Départ", "Check Out")}</th>
                      <th>{lbl("ساعات العمل", "Heures", "Work Hours")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice().reverse().slice(0, 10).map(r => (
                      <tr key={r.id}>
                        <td>{formatDate(r.checkIn)}</td>
                        <td>{formatTime(r.checkIn)}</td>
                        <td>{r.checkOut ? formatTime(r.checkOut) : <span className="badge badge-warning">{lbl("لم يغادر", "En cours", "In progress")}</span>}</td>
                        <td style={{ fontWeight: 600 }}>{r.workHours != null ? r.workHours + " " + lbl("ساعة", "h", "hrs") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Admin: Full table ── */}
      {isAdmin && (
        <>
          {/* Filters */}
          <div className="card" style={{ marginBottom: "16px", padding: "12px 16px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: "180px" }}>
                <label className="form-label">{t(language, "search")}</label>
                <input className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder={lbl("بحث باسم المستخدم...", "Recherche...", "Search by username...")} />
              </div>
              <div>
                <label className="form-label">{t(language, "fromDate")}</label>
                <input className="form-control" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div>
                <label className="form-label">{t(language, "toDate")}</label>
                <input className="form-control" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchData}>{t(language, "filter")}</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setFromDate(""); setToDate(""); }}>✕</button>
            </div>
          </div>

          {/* Summary cards */}
          {records.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: lbl("إجمالي السجلات", "Total enregistrements", "Total Records"), value: records.length, icon: "📋", color: "#3b82f6" },
                { label: lbl("إجمالي ساعات العمل", "Total heures", "Total Hours"), value: records.reduce((s, r) => s + (Number(r.workHours) || 0), 0).toFixed(1) + " " + lbl("ساعة", "h", "hrs"), icon: "⏱️", color: "#10b981" },
                { label: lbl("لا يزال في العمل", "Encore au travail", "Still Working"), value: records.filter(r => !r.checkOut).length, icon: "🟢", color: "#f97316" },
              ].map(c => (
                <div key={c.label} style={{ background: "white", borderRadius: "12px", padding: "14px", border: "1px solid var(--border)", borderTop: `4px solid ${c.color}`, boxShadow: "0 2px 6px rgba(14,36,64,0.07)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase" }}>{c.label}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: "1.4rem" }}>{c.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>...</div>
              ) : records.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>{t(language, "noData")}</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{lbl("المستخدم", "Utilisateur", "User")}</th>
                      <th>{lbl("الموظف", "Employé", "Employee")}</th>
                      <th>{lbl("التاريخ", "Date", "Date")}</th>
                      <th>{lbl("وقت الحضور", "Arrivée", "Check In")}</th>
                      <th>{lbl("وقت المغادرة", "Départ", "Check Out")}</th>
                      <th>{lbl("ساعات العمل", "Heures travaillées", "Work Hours")}</th>
                      <th>{t(language, "actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id}>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.username}</td>
                        <td>{r.workerName || "—"}</td>
                        <td>{formatDate(r.checkIn)}</td>
                        <td style={{ color: "#10b981", fontWeight: 600 }}>{formatTime(r.checkIn)}</td>
                        <td style={{ color: r.checkOut ? "#ef4444" : "var(--text-muted)" }}>
                          {r.checkOut ? formatTime(r.checkOut) : <span className="badge badge-warning">{lbl("لم يغادر", "En cours", "Active")}</span>}
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                          {r.workHours != null && r.checkOut ? r.workHours + " " + lbl("ساعة", "h", "hrs") : "—"}
                        </td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(r.id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Export Modal */}
      {exportModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setExportModal(false)}>
          <div className="modal-box" style={{ maxWidth: "380px" }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px", color: "var(--primary)" }}>
              📥 {lbl("تصدير سجل الحضور", "Exporter les présences", "Export Attendance")}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">{t(language, "fromDate")}</label>
                <input className="form-control" type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} />
              </div>
              <div>
                <label className="form-label">{t(language, "toDate")}</label>
                <input className="form-control" type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} />
              </div>
              <div>
                <label className="form-label">{lbl("صيغة الملف", "Format du fichier", "File Format")}</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["csv", "pdf", "word"] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: "10px", border: `2px solid ${exportFormat === fmt ? "var(--primary)" : "var(--border)"}`,
                        background: exportFormat === fmt ? "#e8f0f8" : "white",
                        cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", color: exportFormat === fmt ? "var(--primary)" : "var(--text)",
                      }}
                    >
                      {fmt === "csv" ? "📊 CSV" : fmt === "pdf" ? "📄 PDF" : "📝 Word"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="btn btn-secondary" onClick={() => setExportModal(false)}>{t(language, "cancel")}</button>
              <button className="btn btn-primary" onClick={() => exportData(exportFormat, exportFrom, exportTo)}>
                📥 {t(language, "export")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: "340px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⚠️</div>
            <p style={{ marginBottom: "20px" }}>{t(language, "deleteConfirm")}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>{t(language, "cancel")}</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>{t(language, "delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
