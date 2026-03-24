"use client";
import { useState, useEffect, useCallback } from "react";
import { t, type Language } from "@/lib/i18n";
import { ALL_PAGES } from "@/lib/auth";

interface User {
  id: number;
  username: string;
  role: string;
  permissions: string;
  isActive: boolean;
}

export default function AdminClient({ lang }: { lang: string }) {
  const language = (lang || "ar") as Language;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", password: "", role: "user", permissions: [] as string[], isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  function openAdd() {
    setEditUser(null);
    setForm({ username: "", password: "", role: "user", permissions: [], isActive: true });
    setShowModal(true);
  }

  function openEdit(user: User) {
    setEditUser(user);
    let perms: string[] = [];
    try { perms = JSON.parse(user.permissions); } catch { perms = []; }
    setForm({ username: user.username, password: "", role: user.role, permissions: perms, isActive: user.isActive });
    setShowModal(true);
  }

  function togglePermission(key: string) {
    setForm((prev) => {
      const perms = prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: perms };
    });
  }

  async function handleSave() {
    setSaving(true);
    const body = { ...form, ...(editUser ? { id: editUser.id } : {}) };
    await fetch("/api/users", {
      method: editUser ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setShowModal(false);
    setSaving(false);
    fetchUsers();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchUsers();
  }

  const pageLabels: Record<string, string> = {};
  ALL_PAGES.forEach((p) => {
    pageLabels[p.key] = language === "ar" ? p.labelAr : language === "fr" ? p.labelFr : p.labelEn;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 {t(language, "admin")}</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ {t(language, "newUser")}</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center" }}>...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>{t(language, "noData")}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t(language, "username")}</th>
                  <th>{t(language, "role")}</th>
                  <th>{t(language, "permissions")}</th>
                  <th>{t(language, "isActive")}</th>
                  <th>{t(language, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  let perms: string[] = [];
                  try { perms = JSON.parse(user.permissions); } catch { perms = []; }
                  return (
                    <tr key={user.id}>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{user.username}</td>
                      <td>
                        <span className={`badge ${user.role === "admin" ? "badge-info" : "badge-secondary"}`}>
                          {t(language, user.role === "admin" ? "roleAdmin" : "roleUser")}
                        </span>
                      </td>
                      <td>
                        {user.role === "admin" ? (
                          <span className="badge badge-success">{language === "ar" ? "كل الصلاحيات" : language === "fr" ? "Toutes permissions" : "All permissions"}</span>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "300px" }}>
                            {perms.length === 0 ? (
                              <span className="badge badge-danger">{language === "ar" ? "لا صلاحيات" : language === "fr" ? "Aucune" : "None"}</span>
                            ) : perms.map((p) => (
                              <span key={p} className="badge badge-info" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                                {pageLabels[p] || p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{user.isActive ? <span className="badge badge-success">{t(language, "active")}</span> : <span className="badge badge-danger">{t(language, "inactive")}</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(user)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(user.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: "640px" }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px", color: "var(--primary)" }}>
              {editUser ? t(language, "editUser") : t(language, "newUser")}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label className="form-label">{t(language, "username")}</label>
                <input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="form-label">{t(language, "password")}{editUser ? " (optional)" : ""}</label>
                <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="form-label">{t(language, "role")}</label>
                <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="user">{t(language, "roleUser")}</option>
                  <option value="admin">{t(language, "roleAdmin")}</option>
                </select>
              </div>
              <div>
                <label className="form-label">{t(language, "isActive")}</label>
                <select className="form-control" value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                  <option value="true">{t(language, "active")}</option>
                  <option value="false">{t(language, "inactive")}</option>
                </select>
              </div>
            </div>

            {form.role === "user" && (
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>{t(language, "permissions")} ({t(language, "pages")})</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", maxHeight: "240px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px" }}>
                  {ALL_PAGES.filter((p) => p.key !== "admin").map((page) => {
                    const label = language === "ar" ? page.labelAr : language === "fr" ? page.labelFr : page.labelEn;
                    const checked = form.permissions.includes(page.key);
                    return (
                      <label
                        key={page.key}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "6px 8px", borderRadius: "6px", cursor: "pointer",
                          background: checked ? "#eff6ff" : "transparent",
                          border: `1px solid ${checked ? "var(--accent)" : "transparent"}`,
                          fontSize: "0.82rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(page.key)}
                          style={{ accentColor: "var(--accent)" }}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t(language, "cancel")}</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "..." : t(language, "save")}</button>
            </div>
          </div>
        </div>
      )}

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
