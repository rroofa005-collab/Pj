"use client";

import { useState, useEffect, useCallback } from "react";
import { t, type Language } from "@/lib/i18n";

interface Column {
  key: string;
  label: string;
  type?: "badge" | "number" | "date" | "boolean";
  badgeMap?: Record<string, string>;
}

interface Field {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "textarea" | "boolean";
  options?: { value: string; label: string }[];
  readOnly?: boolean;
  placeholder?: string;
}

interface PageWrapperProps {
  title: string;
  apiPath: string;
  columns: Column[];
  fields: Field[];
  lang: string;
  role?: string;
  summary?: React.ReactNode;
  extraTopContent?: React.ReactNode;
  defaultValues?: Record<string, unknown>;
  onBeforeSave?: (data: Record<string, unknown>) => Record<string, unknown>;
  renderCustomRow?: (row: Record<string, unknown>, onEdit: () => void, onDelete: () => void, lang: Language) => React.ReactNode;
  summaryFromRows?: (rows: Record<string, unknown>[]) => React.ReactNode;
}

export default function PageWrapper({
  title, apiPath, columns, fields, lang, role = "user", summary, extraTopContent, defaultValues = {}, onBeforeSave, renderCustomRow, summaryFromRows
}: PageWrapperProps) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    fetch(`/api/${apiPath}?${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRows(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiPath, search, fromDate, toDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  function openAdd() {
    setEditRow(null);
    setForm(defaultValues);
    setShowModal(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditRow(row);
    setForm({ ...row });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      let data = { ...form };
      if (onBeforeSave) data = onBeforeSave(data);
      const method = editRow ? "PUT" : "POST";
      await fetch(`/api/${apiPath}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setShowModal(false);
      fetchData();
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/${apiPath}?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchData();
  }

  async function clearData() {
    if (!confirm(t(language, "deleteConfirm"))) return;
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    for (const row of rows) {
      await fetch(`/api/${apiPath}?id=${row.id}`, { method: "DELETE" });
    }
    fetchData();
  }

  function exportData() {
    if (rows.length === 0) return;
    const headers = columns.map((c) => c.label).join(",");
    const csvRows = rows.map((row) =>
      columns.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers, ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatCell(row: Record<string, unknown>, col: Column) {
    const val = row[col.key];
    if (col.type === "date" && val) {
      try { return new Date(val as string).toLocaleDateString(); } catch { return String(val); }
    }
    if (col.type === "boolean") return val ? "✅" : "❌";
    if (col.type === "number" && val !== null && val !== undefined) {
      return Number(val).toLocaleString();
    }
    if (col.type === "badge" && col.badgeMap && val) {
      const cls = col.badgeMap[String(val)] || "badge-secondary";
      const label = val as string;
      return <span className={`badge ${cls}`}>{t(language, label) || label}</span>;
    }
    return String(val ?? "");
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + {t(language, "add")}
          </button>
          {isAdmin && (
            <>
              <button className="btn btn-warning btn-sm" onClick={clearData}>
                🗑 {t(language, "clearData")}
              </button>
              <button className="btn btn-success btn-sm" onClick={exportData}>
                📥 {t(language, "export")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && <div style={{ marginBottom: "16px" }}>{summary}</div>}
      {summaryFromRows && rows.length > 0 && (
        <div style={{ marginBottom: "16px" }}>{summaryFromRows(rows)}</div>
      )}
      {extraTopContent && <div style={{ marginBottom: "16px" }}>{extraTopContent}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: "16px", padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "180px" }}>
            <label className="form-label">{t(language, "search")}</label>
            <input
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(language, "search") + "..."}
            />
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

      {/* Table */}
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
                  {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                  <th>{t(language, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  renderCustomRow
                    ? renderCustomRow(row, () => openEdit(row), () => setDeleteConfirm(row.id as number), language)
                    : (
                      <tr key={String(row.id || idx)}>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{idx + 1}</td>
                        {columns.map((c) => (
                          <td key={c.key}>{formatCell(row, c)}</td>
                        ))}
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(row.id as number)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <h2 style={{ fontWeight: 700, marginBottom: "20px", color: "var(--primary)" }}>
              {editRow ? t(language, "edit") : t(language, "add")} — {title}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {fields.map((field) => (
                <div key={field.key} style={{ gridColumn: field.type === "textarea" ? "1 / -1" : undefined }}>
                  <label className="form-label">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      className="form-control"
                      value={String(form[field.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    >
                      <option value="">--</option>
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="form-control"
                      rows={3}
                      value={String(form[field.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      readOnly={field.readOnly}
                    />
                  ) : field.type === "boolean" ? (
                    <select
                      className="form-control"
                      value={form[field.key] ? "true" : "false"}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value === "true" })}
                    >
                      <option value="true">{t(language, "active")}</option>
                      <option value="false">{t(language, "inactive")}</option>
                    </select>
                  ) : (
                    <input
                      className="form-control"
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={String(form[field.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      readOnly={field.readOnly}
                      placeholder={field.placeholder}
                      step={field.type === "number" ? "any" : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t(language, "cancel")}</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "..." : t(language, "save")}
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
            <p style={{ marginBottom: "20px", color: "var(--text)" }}>{t(language, "deleteConfirm")}</p>
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
