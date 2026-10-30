import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoCard from "../components/VideoCard";
import {
  Course,
  CartCourseItem,
  User,
  translateYear,
  translateBranch,
  translateTerm,
} from "../utils/platformLogic";

interface WatchCoursePageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function WatchCoursePage({
  user,
  tokenState,
  onAuthChange,
}: WatchCoursePageProps) {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [completedLectures, setCompletedLectures] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchCourseAndProgress = async () => {
      setLoading(true);
      const token = Cookies.get("token");
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) {
          setError("تعذر العثور على بيانات هذا الكورس");
          return;
        }
        const data = await res.json();
        setCourse(data);
        setSelectedIdx(0);

        if (token) {
          const cartRes = await fetch("/api/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            const foundItem = cartData?.courses?.find(
              (c: CartCourseItem) => c.course?._id === id
            );
            if (foundItem && Array.isArray(foundItem.completedLectures)) {
              setCompletedLectures(foundItem.completedLectures);
            }
          }
        }
      } catch {
        setError("حدث خطأ أثناء تحميل بيانات المحاضرات");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndProgress();
  }, [id]);

  const handleToggleCompleted = async (lectureIndex: number) => {
    if (!id) return;
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const res = await fetch("/api/cart/progress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id, lectureIndex }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.completedLectures)) {
          setCompletedLectures(data.completedLectures);
        }
      }
    } catch (err) {
      console.error("Failed to update lecture progress:", err);
    }
  };

  const currentLink =
    course?.listOfLec && course.listOfLec.length > 0
      ? course.listOfLec[selectedIdx]
      : null;

  const isCurrentCompleted = completedLectures.includes(selectedIdx);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to={user ? `/courses/${user._id}` : "/courses"}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-[#62ff00] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى قائمة كورساتي</span>
          </Link>
        </div>

        {loading ? (
          <div className="h-96 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse" />
        ) : error || !course ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <p className="text-lg font-bold text-red-400">
              {error || "الكورس غير متوفر"}
            </p>
            <Link
              to="/courses"
              className="inline-block px-4 py-2 text-xs font-bold text-slate-950 bg-[#62ff00] rounded-lg"
            >
              تصفح الكورسات
            </Link>
          </div>
        ) : (
          <>
            {/* Course Header Banner */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{translateYear(course.year)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{translateBranch(course.branch)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{translateTerm(course.term)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {course.subject}
                </h1>
                <p className="text-sm text-slate-300 max-w-3xl">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <img
                  src={course.teacherImg}
                  alt={course.teacher}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-700 bg-slate-800"
                />
                <div>
                  <p className="text-xs text-slate-400">مقدم المقرر</p>
                  <p className="text-sm font-bold text-white">{course.teacher}</p>
                </div>
              </div>
            </div>

            {/* Two-Zone Sandbox Layout: Video Player + Playlist Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Video Stage (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <VideoCard
                  episodeLink={currentLink}
                  episodeNumber={selectedIdx + 1}
                />
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">تشاهد الآن</p>
                    <h2 className="text-base font-bold text-white">
                      المحاضرة رقم {selectedIdx + 1} من {course.subject}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {tokenState && user?.role === "Student" && (
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(selectedIdx)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isCurrentCompleted
                            ? "bg-emerald-950/60 border border-emerald-700 text-emerald-300"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isCurrentCompleted
                            ? "مكتملة"
                            : "تحديد كمكتملة"}
                        </span>
                      </button>
                    )}

                    <span className="text-xs font-mono text-[#62ff00] tabular-nums" dir="ltr">
                      {selectedIdx + 1} / {course.listOfLec.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Episodes Playlist Deck (4 cols) */}
              <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    قائمة المحاضرات
                  </h3>
                  <span className="text-xs text-slate-400 tabular-nums">
                    المكتمل: {completedLectures.length} من {course.listOfLec.length}
                  </span>
                </div>

                {course.listOfLec.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    لا توجد محاضرات مضافة بعد.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pl-1">
                    {course.listOfLec.map((_link, index) => {
                      const active = selectedIdx === index;
                      const done = completedLectures.includes(index);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedIdx(index)}
                          className={`w-full p-3.5 rounded-lg border text-right transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                            active
                              ? "bg-[#62ff00]/15 border-[#62ff00] text-white"
                              : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                                active
                                  ? "bg-[#62ff00] text-slate-950"
                                  : done
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="text-sm font-bold">
                              المحاضرة {index + 1}
                            </span>
                          </div>
                          {done || active ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                done ? "text-emerald-400" : "text-[#62ff00]"
                              }`}
                            />
                          ) : (
                            <Play className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
