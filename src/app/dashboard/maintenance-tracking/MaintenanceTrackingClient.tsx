"use client";
import { useState, useEffect, useCallback } from "react";
import { t, type Language } from "@/lib/i18n";

interface MaintenanceRecord {
  id: number;
  name: string;
  phoneType: string;
  totalCost: number;
  status: string;
  statusNote: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["ready", "in_maintenance", "returned"];
const STATUS_BADGE: Record<string, string> = {
  ready: "badge-success",
  in_maintenance: "badge-warning",
  returned: "badge-secondary",
};

export default function MaintenanceTrackingClient({ lang }: { lang: string }) {
  const language = (lang || "ar") as Language;
  const [rows, setRows] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");

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

  async function saveStatus(row: MaintenanceRecord) {
    await fetch("/api/maintenance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, status: editStatus, statusNote: editNote }),
    });
    setEditingId(null);
    fetchData();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔍 {t(language, "maintenanceTracking")}</h1>
      </div>

      <div className="card" style={{ marginBottom: "16px", padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "180px" }}>
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
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>...</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>{t(language, "noData")}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t(language, "name")}</th>
                  <th>{t(language, "phoneType")}</th>
                  <th>{t(language, "totalCost")}</th>
                  <th>{t(language, "status")}</th>
                  <th>{t(language, "note")}</th>
                  <th>{t(language, "date")}</th>
                  <th>{t(language, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{idx + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.phoneType}</td>
                    <td>{Number(row.totalCost).toLocaleString()}</td>
                    <td>
                      {editingId === row.id ? (
                        <select
                          className="form-control"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ minWidth: "120px" }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{t(language, s === "in_maintenance" ? "inMaintenance" : s)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`badge ${STATUS_BADGE[row.status] || "badge-secondary"}`}>
                          {t(language, row.status === "in_maintenance" ? "inMaintenance" : row.status)}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === row.id ? (
                        <input
                          className="form-control"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          style={{ minWidth: "160px" }}
                        />
                      ) : (
                        row.statusNote || "—"
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      {editingId === row.id ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-success btn-sm" onClick={() => saveStatus(row)}>{t(language, "save")}</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>{t(language, "cancel")}</button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => { setEditingId(row.id); setEditStatus(row.status); setEditNote(row.statusNote || ""); }}
                        >
                          ✏️ {t(language, "edit")}
                        </button>
                      )}
                    </td>
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
