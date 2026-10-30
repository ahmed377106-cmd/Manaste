import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Check, X, Inbox } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  WaitingOrder,
  User,
  translateYear,
  translateBranch,
  translateTerm,
} from "../utils/platformLogic";

interface OrdersPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function OrdersPage({
  user,
  tokenState,
  onAuthChange,
}: OrdersPageProps) {
  const [orders, setOrders] = useState<WaitingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const token = Cookies.get("token");
    setLoading(true);
    try {
      const response = await fetch("/api/cart/waiting", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching waiting orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (
    action: "accept" | "reject",
    cartId: string,
    courseId: string,
    userId: string
  ) => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(`/api/cart/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartId, courseId, userId }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(`Failed to ${action} order:`, err);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              طلبات الاشتراك في حالة الانتظار
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              مراجعة وتفعيل طلبات اشتراك الطلاب في الدورات الدراسية
            </p>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            إجمالي الطلبات المعلقة: {orders.length}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 max-w-md mx-auto my-8">
            <Inbox className="w-10 h-10 text-[#62ff00] mx-auto" />
            <h2 className="text-lg font-bold text-white">
              لا توجد طلبات اشتراك في حالة الانتظار
            </h2>
            <p className="text-xs text-slate-400">
              تمت مراجعة جميع طلبات الطلاب بنجاح.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(({ cartId, course, user: studentUser }) => (
              <article
                key={`${cartId}_${course._id}`}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <img
                      src={course.teacherImg}
                      alt={course.subject}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-[#62ff00]">
                        {course.subject}
                      </h3>
                      <p className="text-xs text-slate-300">{course.teacher}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {translateYear(course.year)} ·{" "}
                        {translateBranch(course.branch)} ·{" "}
                        {translateTerm(course.term)}
                      </p>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3.5 space-y-1.5 text-xs">
                    <p className="font-bold text-white text-sm mb-1">
                      بيانات الطالب مقدم الطلب:
                    </p>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الاسم:</span>
                      <strong className="text-slate-200">
                        {studentUser.name}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">البريد:</span>
                      <span className="text-slate-300 font-mono" dir="ltr">
                        {studentUser.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">هاتف الطالب:</span>
                      <span className="text-slate-200 font-mono tabular-nums" dir="ltr">
                        {studentUser.phone}
                      </span>
                    </div>
                    {studentUser.fatherPhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">هاتف ولي الأمر:</span>
                        <span className="text-slate-200 font-mono tabular-nums" dir="ltr">
                          {studentUser.fatherPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAction(
                        "accept",
                        cartId,
                        course._id,
                        studentUser._id
                      )
                    }
                    className="py-2.5 px-4 rounded-lg bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأكيد وتفعيل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAction(
                        "reject",
                        cartId,
                        course._id,
                        studentUser._id
                      )
                    }
                    className="py-2.5 px-4 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>رفض الطلب</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
