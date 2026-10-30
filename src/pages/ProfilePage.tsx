import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { UserCheck, Bell, CheckCircle2, Save } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  User,
  NotificationItem,
  getBranchesForYear,
} from "../utils/platformLogic";

interface ProfilePageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function ProfilePage({
  user,
  tokenState,
  onAuthChange,
}: ProfilePageProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [fatherPhone, setFatherPhone] = useState(user?.fatherPhone || "");
  const [year, setYear] = useState<string>(user?.year || "Third");
  const [branch, setBranch] = useState<string>(user?.branch || "Math_Science");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const isStudent = user?.role === "Student";
  const availableBranches = getBranchesForYear(year);

  const fetchNotifications = async () => {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setFatherPhone(user.fatherPhone || "");
      setYear(user.year || "Third");
      setBranch(user.branch || "Math_Science");
    }
    fetchNotifications();
  }, [user]);

  const handleMarkNotificationsSeen = async () => {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const res = await fetch("/api/notifications/seen", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notifications seen:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSaving(true);

    const token = Cookies.get("token");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          ...(isStudent ? { fatherPhone, year, branch } : {}),
          ...(password.trim() ? { password: password.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "تعذر تحديث البيانات الشخصية");
        return;
      }
      setPassword("");
      setSuccessMsg("تم حفظ التعديلات بنجاح");
      onAuthChange();
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white">
            الملف الشخصي والإشعارات
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            تحديث بيانات الحساب الشخصي ومتابعة إشعارات تفعيل المقررات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Edit Profile Form (7 cols) */}
          <section className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <UserCheck className="w-5 h-5 text-[#62ff00]" />
              <h2 className="text-lg font-bold text-white">
                تعديل البيانات الشخصية
              </h2>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    الاسم الكامل
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    البريد الإلكتروني
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white font-mono focus:border-[#62ff00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    رقم الهاتف الشخصي
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white font-mono tabular-nums focus:border-[#62ff00] focus:outline-none"
                  />
                </div>

                {isStudent && (
                  <div>
                    <label
                      htmlFor="profile-father-phone"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      رقم هاتف ولي الأمر
                    </label>
                    <input
                      id="profile-father-phone"
                      type="tel"
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white font-mono tabular-nums focus:border-[#62ff00] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {isStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="profile-year"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      السنة الدراسية
                    </label>
                    <select
                      id="profile-year"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        const nextBranches = getBranchesForYear(e.target.value);
                        if (nextBranches.length > 0) {
                          setBranch(nextBranches[0].value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                    >
                      <option value="First">الصف الأول الثانوي</option>
                      <option value="Second">الصف الثاني الثانوي</option>
                      <option value="Third">الصف الثالث الثانوي</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-branch"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      الشعبة الدراسية
                    </label>
                    <select
                      id="profile-branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                    >
                      {availableBranches.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="profile-password"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  كلمة مرور جديدة (اتركها فارغة إذا لم ترغب في تغييرها)
                </label>
                <input
                  id="profile-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Notifications Panel (5 cols) */}
          <section className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#62ff00]" />
                <h2 className="text-lg font-bold text-white">
                  إشعارات الحساب ({notifications.length})
                </h2>
              </div>
              {notifications.some((n) => !n.seen) && (
                <button
                  type="button"
                  onClick={handleMarkNotificationsSeen}
                  className="text-xs text-[#62ff00] hover:underline cursor-pointer"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                لا توجد إشعارات جديدة حتى الآن.
              </p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pl-1">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed space-y-1 ${
                      item.seen
                        ? "bg-slate-950/60 border-slate-800 text-slate-300"
                        : "bg-[#62ff00]/10 border-[#62ff00]/40 text-white"
                    }`}
                  >
                    {item.title && (
                      <p className="font-bold text-white">{item.title}</p>
                    )}
                    <p className="font-medium">
                      {item.description || item.message}
                    </p>
                    <p className="text-slate-400 tabular-nums">
                      {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
