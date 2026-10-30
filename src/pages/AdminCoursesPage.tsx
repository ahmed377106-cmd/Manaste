import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Plus, Edit3, Video, Trash2, PauseCircle, PlayCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  CourseFormModal,
  LectureCourseModal,
  ConfirmationModal,
} from "../components/AdminModals";
import {
  Course,
  DashboardStats,
  User,
  translateYear,
  translateBranch,
  translateTerm,
} from "../utils/platformLogic";

interface AdminCoursesPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function AdminCoursesPage({
  user,
  tokenState,
  onAuthChange,
}: AdminCoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lectureModalCourse, setLectureModalCourse] = useState<Course | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const isAdmin = user?.role === "Admin";

  const fetchCoursesAndStats = async () => {
    setLoading(true);
    setError("");
    const token = Cookies.get("token");
    try {
      const [coursesRes, statsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/stats", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (!coursesRes.ok) throw new Error("فشل جلب الكورسات");
      const coursesData = await coursesRes.json();
      setCourses(Array.isArray(coursesData) ? coursesData : []);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch {
      setError("حدث خطأ أثناء تحميل قائمة الكورسات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndStats();
  }, []);

  const handleToggleSuspend = async (courseId: string) => {
    const token = Cookies.get("token");
    try {
      const res = await fetch(`/api/courses/${courseId}/suspend`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        fetchCoursesAndStats();
      }
    } catch (err) {
      console.error("Failed to toggle suspend:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const token = Cookies.get("token");
    try {
      const res = await fetch(`/api/courses/${deleteTarget._id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        fetchCoursesAndStats();
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              إدارة الكورسات والمقررات
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              إضافة وتعديل المقررات الدراسية، رفع روابط المحاضرات، والتحكم في حالة النشر
            </p>
          </div>

          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => {
              setSelectedCourse(null);
              setModalMode("add");
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors whitespace-nowrap shrink-0 ${
              isAdmin
                ? "bg-[#62ff00] hover:bg-[#52d600] text-slate-950 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كورس جديد</span>
          </button>
        </div>

        {/* Live Platform Analytics Strip */}
        {stats && (
          <section
            aria-label="ملخص إحصائيات المنصة"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-1">
              <p className="text-xs text-slate-400">إجمالي الطلاب المسجلين</p>
              <p className="text-2xl font-extrabold text-white tabular-nums">
                {stats.totalStudents}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-1">
              <p className="text-xs text-slate-400">الكورسات النشطة / المحاضرات</p>
              <p className="text-2xl font-extrabold text-[#62ff00] tabular-nums">
                {stats.activeCourses} / {stats.totalLectures}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-1">
              <p className="text-xs text-slate-400">الطلبات المعلقة للمراجعة</p>
              <p className="text-2xl font-extrabold text-amber-400 tabular-nums">
                {stats.waitingOrders}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-1">
              <p className="text-xs text-slate-400">الاشتراكات المفعلة</p>
              <p className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                {stats.acceptedEnrollments}
              </p>
            </div>
          </section>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
            لا توجد كورسات مسجلة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <article
                key={course._id}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-300">{course.teacher}</p>
                        <h3 className="text-lg font-bold text-white">
                          {course.subject}
                        </h3>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          course.suspend ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {course.suspend ? "معلق" : "نشط"}
                      </span>
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

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 tabular-nums">
                      <span>المحاضرات: {course.listOfLec?.length || 0}</span>
                      <span>السعر: {course.price || 200} ج.م</span>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(course);
                        setModalMode("edit");
                      }}
                      className="py-2 px-3 rounded-lg bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تحرير</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLectureModalCourse(course)}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 text-[#62ff00]" />
                      <span>المحاضرات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSuspend(course._id)}
                      className="py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {course.suspend ? (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تفعيل</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>تعليق</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(course)}
                      className="py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-red-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {modalMode && (
        <CourseFormModal
          mode={modalMode}
          course={selectedCourse}
          onClose={() => {
            setModalMode(null);
            setSelectedCourse(null);
          }}
          onSaved={fetchCoursesAndStats}
        />
      )}

      {lectureModalCourse && (
        <LectureCourseModal
          course={lectureModalCourse}
          onClose={() => setLectureModalCourse(null)}
          onUpdated={fetchCoursesAndStats}
        />
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        courseName={deleteTarget?.subject || ""}
        teacherName={deleteTarget?.teacher || ""}
      />

      <Footer />
    </div>
  );
}
