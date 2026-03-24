"use client";
import { useState, useEffect, useCallback } from "react";
import { t, type Language } from "@/lib/i18n";

interface ServiceRecord {
  id: number;
  receivedDollar: number;
  remainingDollar: number;
  name: string;
  serviceType: string;
  amountDollar: number;
  amountDinar: number;
  status: string;
  createdAt: string;
}

export default function ElectronicServicesClient({ lang }: { lang: string }) {
  const language = (lang || "ar") as Language;
  const [rows, setRows] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState<ServiceRecord | null>(null);
  const [form, setForm] = useState({ receivedDollar: 0, name: "", serviceType: "", amountDollar: 0, amountDinar: 0, status: "paid" });
  const [saving, setSaving] = useState(false);

  const totalReceived = rows.reduce((s, r) => s + (r.receivedDollar || 0), 0);
  const totalSpent = rows.reduce((s, r) => s + (r.amountDollar || 0), 0);
  const currentRemaining = totalReceived - totalSpent;

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    fetch(`/api/electronic-services?${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRows(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, fromDate, toDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  function openAdd() {
    setEditRow(null);
    setForm({ receivedDollar: 0, name: "", serviceType: "", amountDollar: 0, amountDinar: 0, status: "paid" });
    setShowModal(true);
  }

  function openEdit(row: ServiceRecord) {
    setEditRow(row);
    setForm({ receivedDollar: row.receivedDollar, name: row.name, serviceType: row.serviceType, amountDollar: row.amountDollar, amountDinar: row.amountDinar, status: row.status });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const remaining = currentRemaining + Number(form.receivedDollar) - Number(form.amountDollar);
    const body = { ...form, remainingDollar: remaining, ...(editRow ? { id: editRow.id } : {}) };
    await fetch("/api/electronic-services", {
      method: editRow ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setShowModal(false);
    setSaving(false);
    fetchData();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/electronic-services?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  function exportData() {
    if (rows.length === 0) return;
    const headers = [t(language, "name"), t(language, "serviceType"), t(language, "amountDollar"), t(language, "amountDinar"), t(language, "status"), t(language, "date")].join(",");
    const csvRows = rows.map((r) => [r.name, r.serviceType, r.amountDollar, r.amountDinar, r.status, r.createdAt].map((v) => `"${v}"`).join(","));
    const csv = [headers, ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `electronic-services-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚡ {t(language, "electronicServices")}</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ {t(language, "add")}</button>
          <button className="btn btn-success btn-sm" onClick={exportData}>📥 {t(language, "export")}</button>
        </div>
      </div>

      {/* Dollar summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="form-label">{t(language, "receivedDollar")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981" }}>${totalReceived.toLocaleString()}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="form-label">{t(language, "remainingDollar")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: currentRemaining >= 0 ? "#3b82f6" : "#ef4444" }}>
            ${currentRemaining.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "16px", padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label className="form-label">{t(language, "search")}</label>
            <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} />
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
          {loading ? <div style={{ padding: "32px", textAlign: "center" }}>...</div> :
            rows.length === 0 ? <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>{t(language, "noData")}</div> : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t(language, "name")}</th>
                    <th>{t(language, "serviceType")}</th>
                    <th>{t(language, "amountDollar")}</th>
                    <th>{t(language, "amountDinar")}</th>
                    <th>{t(language, "remainingDollar")}</th>
                    <th>{t(language, "status")}</th>
                    <th>{t(language, "date")}</th>
                    <th>{t(language, "actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id}>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{idx + 1}</td>
                      <td>{row.name}</td>
                      <td>{row.serviceType}</td>
                      <td>${Number(row.amountDollar).toLocaleString()}</td>
                      <td>{Number(row.amountDinar).toLocaleString()} DA</td>
                      <td>${Number(row.remainingDollar).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${row.status === "paid" ? "badge-success" : "badge-danger"}`}>
                          {t(language, row.status)}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <h2 style={{ fontWeight: 700, marginBottom: "20px", color: "var(--primary)" }}>
              {editRow ? t(language, "edit") : t(language, "add")}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="form-label">{t(language, "receivedDollar")}</label>
                <input className="form-control" type="number" value={form.receivedDollar} onChange={(e) => setForm({ ...form, receivedDollar: Number(e.target.value) })} step="any" />
              </div>
              <div>
                <label className="form-label">{t(language, "name")}</label>
                <input className="form-control" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="form-label">{t(language, "serviceType")}</label>
                <input className="form-control" type="text" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} />
              </div>
              <div>
                <label className="form-label">{t(language, "amountDollar")}</label>
                <input className="form-control" type="number" value={form.amountDollar} onChange={(e) => setForm({ ...form, amountDollar: Number(e.target.value) })} step="any" />
              </div>
              <div>
                <label className="form-label">{t(language, "amountDinar")}</label>
                <input className="form-control" type="number" value={form.amountDinar} onChange={(e) => setForm({ ...form, amountDinar: Number(e.target.value) })} step="any" />
              </div>
              <div>
                <label className="form-label">{t(language, "status")}</label>
                <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="paid">{t(language, "paid")}</option>
                  <option value="debt">{t(language, "unpaid")}</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t(language, "cancel")}</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "..." : t(language, "save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
