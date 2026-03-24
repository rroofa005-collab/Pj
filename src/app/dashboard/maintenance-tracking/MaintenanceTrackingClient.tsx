"use client";
import { useState, useEffect, useCallback } from "react";
import { t, type Language } from "@/lib/i18n";

interface MaintenanceRecord {
  id: number;
  name: string;
  phoneType: string;
  dueAmount: number;
  status: string;
  statusNote: string;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  ready: "badge-success",
  in_maintenance: "badge-warning",
  returned: "badge-secondary",
};

export default function MaintenanceTrackingClient({ lang, role }: { lang: string; role: string }) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    fetch(`/api/maintenance?${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRows(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, fromDate, toDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  async function updateStatus(row: MaintenanceRecord, newStatus: string, note: string) {
    const today = new Date().toLocaleDateString("ar-DZ");
    await fetch("/api/maintenance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...row, 
        status: newStatus, 
        statusNote: `${note} - ${today}` 
      }),
    });
    fetchData();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔍 {t(language, "maintenanceTracking")}</h1>
      </div>

      <div className="card" style={{ marginBottom: "12px", padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "140px" }}>
            <label className="form-label">{t(language, "search")}</label>
            <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(language, "search") + "..."} />
          </div>
          <div>
            <label className="form-label">{t(language, "fromDate")}</label>
            <input className="form-control" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">{t(language, "toDate")}</label>
            <input className="form-control" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>{t(language, "filter")}</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>...</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>{t(language, "noData")}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t(language, "name")}</th>
                  <th>{t(language, "phoneType")}</th>
                  <th>{t(language, "dueAmount")}</th>
                  <th>{t(language, "status")}</th>
                  <th>{t(language, "note")}</th>
                  {isAdmin && <th>{t(language, "actions")}</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{row.name}</td>
                    <td>{row.phoneType}</td>
                    <td style={{ fontWeight: 600, color: "var(--primary)" }}>{Number(row.dueAmount).toLocaleString()} DA</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[row.status] || "badge-secondary"}`}>
                        {t(language, row.status === "in_maintenance" ? "inMaintenance" : row.status)}
                      </span>
                    </td>
                    <td style={{ maxWidth: "150px", fontSize: "0.8rem" }}>
                      {row.statusNote || "—"}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ fontSize: "0.7rem", padding: "3px 6px" }}
                            onClick={() => updateStatus(row, "ready", "تم الدفع والاستلام")}
                          >
                            ✅ {language === "ar" ? "تم الدفع" : "Payé"}
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            style={{ fontSize: "0.7rem", padding: "3px 6px" }}
                            onClick={() => updateStatus(row, "returned", "تم الإرجاع")}
                          >
                            ↩️ {language === "ar" ? "إرجاع" : "Retour"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}