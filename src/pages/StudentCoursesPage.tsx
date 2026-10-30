import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { PlayCircle, Clock, XCircle, AlertTriangle, Trash2, BookOpen } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  CartCourseItem,
  User,
  translateYear,
  translateBranch,
  translateTerm,
  translateStatus,
} from "../utils/platformLogic";

interface StudentCoursesPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function StudentCoursesPage({
  user,
  tokenState,
  onAuthChange,
}: StudentCoursesPageProps) {
  const [items, setItems] = useState<CartCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyCourses = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.courses && Array.isArray(data.courses)) {
          setItems(data.courses.filter((c: CartCourseItem) => c.course));
        } else {
          setItems([]);
        }
      }
    } catch (err) {
      console.error("Error fetching student courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleRemoveCourse = async (courseId: string) => {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/cart/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchMyCourses();
      }
    } catch (err) {
      console.error("Failed to remove course:", err);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              كورساتي المشترك بها
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              تابع حالة اشتراكاتك وشاهد المحاضرات المفعلة مباشرة
            </p>
          </div>
          <Link
            to="/courses"
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#62ff00] hover:bg-[#52d600] rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            استكشف المزيد من الكورسات
          </Link>
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
        ) : items.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-4 max-w-lg mx-auto my-8">
            <BookOpen className="w-12 h-12 text-[#62ff00] mx-auto" />
            <h2 className="text-xl font-bold text-white">
              أنت غير مشترك في أي كورس حتى الآن
            </h2>
            <p className="text-sm text-slate-400">
              تصفح المقررات الدراسية المتاحة لصفك الدراسي وقدم طلب اشتراك ليتم
              تفعيله لك.
            </p>
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="px-6 py-2.5 bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              احجز كورس الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ _id, course, status }) => {
              const isAccepted = status === "Accepted" && !course.suspend;
              const lectureCount = course.listOfLec?.length || 0;

              return (
                <article
                  key={_id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden"
                >
                  <div>
                    <div className="aspect-[16/9] w-full bg-slate-800 relative overflow-hidden border-b border-slate-800">
                      <img
                        src={course.teacherImg}
                        alt={course.subject}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                      <div className="absolute bottom-3 right-3 left-3">
                        <p className="text-xs text-slate-300">{course.teacher}</p>
                        <h3 className="text-lg font-bold text-white">
                          {course.subject}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                        <span>{translateYear(course.year)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{translateBranch(course.branch)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{translateTerm(course.term)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                        <span className="text-slate-400 tabular-nums">
                          المحاضرات المتاحة: <strong className="text-white">{lectureCount}</strong>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            status === "Accepted"
                              ? "text-emerald-400"
                              : status === "Rejected"
                              ? "text-red-400"
                              : "text-amber-400"
                          }`}
                        >
                          {status === "Accepted" && <PlayCircle className="w-3.5 h-3.5" />}
                          {status === "Waiting" && <Clock className="w-3.5 h-3.5" />}
                          {status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                          {status === "WaitingNextPayment" && (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {course.suspend
                              ? "الكورس معلق مؤقتاً"
                              : translateStatus(status)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!isAccepted || lectureCount === 0}
                      onClick={() => navigate(`/watch/${course._id}`)}
                      className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                        isAccepted && lectureCount > 0
                          ? "bg-[#62ff00] hover:bg-[#52d600] text-slate-950 cursor-pointer"
                          : "bg-slate-800 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {course.suspend
                        ? "الكورس معلق"
                        : status === "Accepted"
                        ? lectureCount > 0
                          ? "مشاهدة الكورس"
                          : "لا توجد محاضرات بعد"
                        : status === "Waiting"
                        ? "برجاء انتظار التفعيل"
                        : status === "WaitingNextPayment"
                        ? "برجاء تجديد الاشتراك"
                        : "تم رفض الطلب"}
                    </button>

                    {status !== "Accepted" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(course._id)}
                        aria-label={`إلغاء طلب ${course.subject}`}
                        className="p-2.5 text-red-400 hover:text-red-300 border border-slate-800 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
