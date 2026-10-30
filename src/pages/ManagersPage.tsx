import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Search, UserPlus, Trash2, Shield, UserCheck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AddManagerModal } from "../components/AdminModals";
import { User } from "../utils/platformLogic";

interface ManagersPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function ManagersPage({
  user,
  tokenState,
  onAuthChange,
}: ManagersPageProps) {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === "Admin";

  const fetchAdmins = async () => {
    setLoading(true);
    const token = Cookies.get("token");
    try {
      const response = await fetch("/api/auth/getadmins", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleUpdateRole = async (adminId: string, newRole: "Admin" | "Manager") => {
    const token = Cookies.get("token");
    try {
      const response = await fetch("/api/auth/updateRole", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: adminId, newRole }),
      });
      if (response.ok) {
        fetchAdmins();
      }
    } catch (err) {
      console.error("Error updating manager role:", err);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(`/api/auth/deleteAccount/${adminId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        fetchAdmins();
      }
    } catch (err) {
      console.error("Error deleting manager:", err);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q)
    );
  });

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              إدارة المشرفين والمسؤولين
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              عرض حسابات الإدارة والمشرفين والتحكم في صلاحيات الفريق
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مشرف إداري</span>
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            aria-label="بحث في قائمة المشرفين"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، البريد الإلكتروني، أو الدور..."
            className="w-full pr-10 pl-4 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white focus:border-[#62ff00] focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-36 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
            لا يوجد مشرفون مطابقون للبحث.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAdmins.map((admin) => (
              <article
                key={admin._id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {admin.role === "Admin" ? (
                      <Shield className="w-5 h-5 text-[#62ff00]" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-sky-400" />
                    )}
                    <h2 className="text-lg font-bold text-white">
                      {admin.name}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-400">
                    الصلاحية:{" "}
                    <strong className="text-slate-200">
                      {admin.role === "Admin" ? "مدير عام" : "مشرف إداري"}
                    </strong>
                  </p>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">
                    {admin.email}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">
                    الهاتف: <span className="font-mono" dir="ltr">{admin.phone}</span>
                  </p>
                </div>

                {isAdmin && admin._id !== user?._id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      aria-label={`تغيير صلاحية ${admin.name}`}
                      value={admin.role}
                      onChange={(e) =>
                        handleUpdateRole(
                          admin._id,
                          e.target.value as "Admin" | "Manager"
                        )
                      }
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                    >
                      <option value="Manager">مشرف إداري</option>
                      <option value="Admin">مدير عام</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteAdmin(admin._id)}
                      aria-label={`حذف حساب ${admin.name}`}
                      className="px-3.5 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <AddManagerModal
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchAdmins}
        />
      )}

      <Footer />
    </div>
  );
}
