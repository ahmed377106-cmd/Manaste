import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Search, CheckCircle2, Ban, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Cart,
  User,
  EnrollmentStatus,
  translateYear,
  translateBranch,
  translateStatus,
} from "../utils/platformLogic";

interface StudentsPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function StudentsPage({
  user,
  tokenState,
  onAuthChange,
}: StudentsPageProps) {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    Record<string, EnrollmentStatus>
  >({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const fetchStudents = async () => {
    const token = Cookies.get("token");
    setLoading(true);
    try {
      const response = await fetch("/api/cart/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: Cart[] = await response.json();
        const validCarts = Array.isArray(data)
          ? data.filter((c) => c.user)
          : [];
        setCarts(validCarts);

        const initialMap: Record<string, EnrollmentStatus> = {};
        validCarts.forEach((cart) => {
          cart.courses.forEach((item) => {
            if (item.course?._id) {
              initialMap[`${cart._id}_${item.course._id}`] = item.status;
            }
          });
        });
        setSelectedStatus(initialMap);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredCarts = carts.filter((cart) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cart.user.name.toLowerCase().includes(q) ||
      cart.user.email.toLowerCase().includes(q) ||
      cart.user.phone.includes(q)
    );
  });

  const handleSaveStatus = async (cartId: string, courseId: string) => {
    const token = Cookies.get("token");
    const key = `${cartId}_${courseId}`;
    const newStatus = selectedStatus[key];
    if (!newStatus) return;

    try {
      const response = await fetch("/api/cart/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartId, courseId, status: newStatus }),
      });

      if (response.ok) {
        setSavedNotice(key);
        setTimeout(() => setSavedNotice(null), 2000);
        fetchStudents();
      }
    } catch (err) {
      console.error("Error updating course status:", err);
    }
  };

  const handleToggleBlockStudent = async (studentId: string) => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(`/api/auth/block/${studentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error("Error toggling student block state:", err);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              إدارة الطلاب المسجلين
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              عرض بيانات الطلاب وأرقام أولياء الأمور وتحديث حالة الاشتراك لكل مقرر
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="بحث بالاسم أو البريد الإلكتروني"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، البريد، أو الهاتف..."
              className="w-full pr-10 pl-4 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCarts.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
            لا يوجد طلاب مطابقون للبحث.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCarts.map((cart) => {
              const student = cart.user;
              return (
                <article
                  key={cart._id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-bold text-white">
                          {student.name}
                        </h2>
                        {student.blocked && (
                          <span className="text-xs font-bold text-red-400">
                            (حساب محظور)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {translateYear(student.year)} ·{" "}
                        {translateBranch(student.branch)} ·{" "}
                        <span className="font-mono" dir="ltr">
                          {student.email}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 ml-2">هاتف الطالب:</span>
                        <strong className="text-white font-mono" dir="ltr">
                          {student.phone}
                        </strong>
                      </div>
                      {student.fatherPhone && (
                        <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-slate-400 ml-2">
                            هاتف ولي الأمر:
                          </span>
                          <strong className="text-[#62ff00] font-mono" dir="ltr">
                            {student.fatherPhone}
                          </strong>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleBlockStudent(student._id)}
                        className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          student.blocked
                            ? "border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
                            : "border-red-800/60 bg-red-950/40 text-red-300 hover:bg-red-900/50"
                        }`}
                      >
                        {student.blocked ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>فك الحظر</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>حظر الحساب</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Student Enrolled Courses */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-400">
                      المقررات المشترك بها ({cart.courses.length}):
                    </h3>

                    {cart.courses.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        لم يقم الطالب بالاشتراك في أي كورس حتى الآن.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-800/80 rounded-lg border border-slate-800 bg-slate-950/60">
                        {cart.courses.map((item) => {
                          if (!item.course) return null;
                          const key = `${cart._id}_${item.course._id}`;
                          const currentVal = selectedStatus[key] || item.status;

                          return (
                            <div
                              key={item._id}
                              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-white">
                                  {item.course.subject}{" "}
                                  <span className="text-xs font-normal text-slate-400">
                                    ({item.course.teacher})
                                  </span>
                                </p>
                                <p
                                  className={`text-xs font-semibold ${
                                    item.status === "Accepted"
                                      ? "text-emerald-400"
                                      : item.status === "Rejected"
                                      ? "text-red-400"
                                      : "text-amber-400"
                                  }`}
                                >
                                  الحالة الحالية: {translateStatus(item.status)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <select
                                  aria-label={`تغيير حالة ${item.course.subject} للطالب ${student.name}`}
                                  value={currentVal}
                                  onChange={(e) =>
                                    setSelectedStatus((prev) => ({
                                      ...prev,
                                      [key]: e.target.value as EnrollmentStatus,
                                    }))
                                  }
                                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white focus:border-[#62ff00] focus:outline-none"
                                >
                                  <option value="Accepted">مقبول (مفعل)</option>
                                  <option value="Waiting">انتظار القبول</option>
                                  <option value="WaitingNextPayment">
                                    انتظار الدفع التالي
                                  </option>
                                  <option value="Rejected">مرفوض</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveStatus(cart._id, item.course._id)
                                  }
                                  className="px-4 py-1.5 rounded-lg bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  {savedNotice === key ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>تم الحفظ</span>
                                    </>
                                  ) : (
                                    <span>حفظ</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
