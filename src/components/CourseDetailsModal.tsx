import React, { useState } from "react";
import Cookies from "js-cookie";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Course,
  translateYear,
  translateBranch,
  translateTerm,
} from "../utils/platformLogic";

interface CourseDetailsModalProps {
  course: Course | null;
  onClose: () => void;
  userId?: string;
  onSubscribed?: () => void;
}

export default function CourseDetailsModal({
  course,
  onClose,
  userId,
  onSubscribed,
}: CourseDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  if (!course) return null;

  const cashPhone = "01011223344";
  const whatsPhone = "01122334455";
  const price = course.price || 200;

  const handleSubscribe = async () => {
    const token = Cookies.get("token");
    if (!token || !userId) {
      setStatusMessage({
        type: "error",
        text: "يرجى تسجيل الدخول أولاً للاشتراك في الكورس",
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          courseId: course._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "تم إرسال طلب الاشتراك بنجاح! سيتم تفعيل الكورس فور مراجعة الإدارة.",
        });
        if (onSubscribed) onSubscribed();
      } else if (response.status === 409 || response.status === 301) {
        setStatusMessage({
          type: "warning",
          text: data.message || "أنت مشترك بالفعل في هذا الكورس",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.message || "حدث خطأ أثناء إرسال الطلب",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2
              id="course-modal-title"
              className="text-xl font-bold text-white"
            >
              تأكيد الاشتراك في: {course.subject}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {course.teacher} · {translateYear(course.year)} ·{" "}
              {translateBranch(course.branch)} · {translateTerm(course.term)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            للاشتراك في مقرر{" "}
            <strong className="text-[#62ff00]">{course.subject}</strong>، يرجى
            تحويل قيمة الاشتراك وتأكيد الطلب:
          </p>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">قيمة الاشتراك:</span>
              <strong className="text-[#62ff00] font-mono tabular-nums">
                {price} ج.م
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">رقم محفظة التحويل:</span>
              <strong className="text-white font-mono tabular-nums">
                {cashPhone}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">واتساب إرسال الإيصال:</span>
              <strong className="text-white font-mono tabular-nums">
                {whatsPhone}
              </strong>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            ملاحظة: بعد الضغط على زر &quot;تأكيد طلب الاشتراك&quot; سيظهر الكورس في صفحة{" "}
            <strong className="text-slate-200">كورساتي</strong> بحالة انتظار حتى
            يقوم المشرف بتفعيله لك.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-lg border text-sm flex items-center gap-2.5 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/50 border-emerald-800 text-emerald-300"
                : statusMessage.type === "warning"
                ? "bg-amber-950/50 border-amber-800 text-amber-300"
                : "bg-red-950/50 border-red-800 text-red-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          <button
            type="button"
            disabled={loading || statusMessage?.type === "success"}
            onClick={handleSubscribe}
            className="px-5 py-2 text-sm font-bold text-slate-950 bg-[#62ff00] hover:bg-[#52d600] disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {loading
              ? "جاري تقديم الطلب..."
              : statusMessage?.type === "success"
              ? "تم تقديم الطلب"
              : "تأكيد طلب الاشتراك"}
          </button>
        </div>
      </div>
    </div>
  );
}
