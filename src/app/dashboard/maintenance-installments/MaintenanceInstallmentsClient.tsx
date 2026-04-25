"use client";
import { useState, useEffect } from "react";
import { t, type Language } from "@/lib/i18n";
import Link from "next/link";

interface Installment {
  id: number;
  maintenanceId: number;
  maintenanceName: string;
  amount: number;
  paidAmount: number;
  installmentDate: string;
  createdAt: string;
}

export default function MaintenanceInstallmentsClient({ lang, role }: { lang: string; role?: string }) {
  const language = (lang || "ar") as Language;
  const isAdmin = role === "admin";
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInstallments();
  }, []);

  async function fetchInstallments() {
    try {
      const res = await fetch("/api/maintenance-installments");
      const data = await res.json();
      setInstallments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching installments:", e);
      setInstallments([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = installments.filter(inst => 
    inst.maintenanceName.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
  const totalPaid = installments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <div className="text-2xl">🔄</div>
          <div className="text-gray-500 mt-2">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">💰 قسط الصيانة</h1>
          <p className="text-gray-500 text-sm mt-1">{t(language, "maintenance")} - أقساط الصيانة</p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/maintenance-installments/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            ➕ إضافة قسط جديد
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي الأقساط</div>
          <div className="text-2xl font-bold text-gray-800">{installments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي المبلغ</div>
          <div className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} DA</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">إجمالي المدفوع</div>
          <div className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()} DA</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <input
          type="text"
          placeholder="🔍 بحث بالاسم..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            📭 لا توجد أقساط صيانة
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">#</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">اسم الصيانة</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">المبلغ</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">المدفوع</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">تاريخ القسط</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst, idx) => (
                  <tr key={inst.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-400 text-sm">{idx + 1}</td>
                    <td className="p-4 font-medium text-gray-800">{inst.maintenanceName}</td>
                    <td className="p-4 text-blue-600 font-semibold">{inst.amount} DA</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inst.paidAmount >= inst.amount ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {inst.paidAmount} DA
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(inst.installmentDate).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
