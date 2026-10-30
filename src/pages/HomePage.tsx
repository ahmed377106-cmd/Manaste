import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ArrowLeft, BookOpen, CheckCircle, Play, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import CourseDetailsModal from "../components/CourseDetailsModal";
import { Course, User } from "../utils/platformLogic";

interface HomePageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function HomePage({
  user,
  tokenState,
  onAuthChange,
}: HomePageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCourses(data.filter((c: Course) => !c.suspend).slice(0, 6));
          }
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleBookClick = (course: Course) => {
    const token = Cookies.get("token");
    if (!token || !user) {
      navigate("/login");
      return;
    }
    setSelectedCourse(course);
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthChange} />

      <main className="flex-1">
        {/* Hero Split Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Right Column (RTL Primary Copy) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <p className="text-sm font-semibold text-[#62ff00] tracking-wide">
                منصة التعليم الإلكتروني للمرحلة الثانوية والقدرات
              </p>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
                style={{ textWrap: "balance" }}
              >
                تعلّم أونلاين وتأسس صح في المواد العلمية والقدرات
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                احصل على شرح منهجي مبسط ومحاضرات مصورة عالية الجودة في الفيزياء،
                الكيمياء، الرياضيات، اللغات، والقدرات اللفظية والكمية مع نخبة من
                المعلمين المتخصصين.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-extrabold text-base transition-colors whitespace-nowrap shrink-0"
                >
                  <span>استكشف الدورات المتاحة</span>
                  <ArrowLeft className="w-5 h-5" />
                </Link>

                {!tokenState ? (
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-base transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>إنشاء حساب طالب جديد</span>
                  </Link>
                ) : user?.role === "Student" ? (
                  <Link
                    to={`/courses/${user._id}`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-base transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>الذهاب إلى كورساتي</span>
                  </Link>
                ) : (
                  <Link
                    to="/coursesdashboard"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-base transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>لوحة تحكم الإدارة</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Left Column (Visual Showcase Card) */}
            <div className="lg:col-span-5 flex">
              <div className="w-full rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        المسارات الدراسية المتكاملة
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        الصف الأول · الثاني · الثالث الثانوي
                      </p>
                    </div>
                    <BookOpen className="w-6 h-6 text-[#62ff00]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <p className="font-bold text-white">الشعبة العلمية</p>
                      <p className="text-xs text-slate-400 mt-1">
                        الفيزياء · الكيمياء · الأحياء
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <p className="font-bold text-white">علمي رياضة</p>
                      <p className="text-xs text-slate-400 mt-1">
                        التفاضل · الجبر · الاستاتيكا
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <p className="font-bold text-white">الشعبة الأدبية</p>
                      <p className="text-xs text-slate-400 mt-1">
                        التاريخ · الجغرافيا · الفلسفة
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <p className="font-bold text-white">اللغات والقدرات</p>
                      <p className="text-xs text-slate-400 mt-1">
                        العربية · الإنجليزية · القدرات
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-400">معدل إتمام المحاضرات</p>
                    <p className="text-sm font-bold text-white">
                      متابعة دورية وتقييم مستمر للطلاب
                    </p>
                  </div>
                  <span className="text-lg font-extrabold text-[#62ff00] font-mono tabular-nums">
                    100%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-Column Proof Strip */}
          <div className="mt-12 pt-10 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                +1,250
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                طالب مسجل في المقررات الدراسية خلال العام الدراسي الحالي
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#62ff00] font-mono tabular-nums">
                +180
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                محاضرة مصورة ومراجعة نهائية بجودة عالية
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                3 مراحل
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                تغطية شاملة للصف الأول والثاني والثالث الثانوي
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                24/7
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                وصول مستمر للمحاضرات المسجلة من أي جهاز وفي أي وقت
              </p>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="max-w-7xl mx-auto px-6 py-14 border-t border-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                أحدث الدورات والمقررات الدراسية
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                اختر المقرر المناسب لصفك الدراسي وشعبتك وابدأ التعلم فوراً
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#62ff00] hover:underline whitespace-nowrap shrink-0"
            >
              <span>عرض جميع الكورسات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="p-10 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
              لا توجد دورات متاحة حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((courseItem) => (
                <CourseCard
                  key={courseItem._id}
                  courseItem={courseItem}
                  buttonLabel="احجز الآن"
                  onButtonClick={handleBookClick}
                  userRole={user?.role || "Student"}
                />
              ))}
            </div>
          )}
        </section>

        {/* Why Choose Our Courses Section */}
        <section className="max-w-7xl mx-auto px-6 py-14 border-t border-slate-900">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8">
            لماذا دوراتنا هي الخيار الأفضل لك؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <CheckCircle className="w-7 h-7 text-[#62ff00]" />
              <h3 className="text-lg font-bold text-white">
                تأسيس علمي متدرج وشامل
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                شرح مفصل يبدأ من الأساسيات حتى مستويات التفكير العليا، مصمم خصيصاً
                ليناسب نظام التقييم الحديث في المرحلة الثانوية.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <Play className="w-7 h-7 text-[#62ff00]" />
              <h3 className="text-lg font-bold text-white">
                محاضرات مصورة عالية الدقة
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                إمكانية مشاهدة المحاضرات وإعادة تشغيلها في أي وقت مع تقسيم منظم
                للدروس والوحدات الدراسية.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <ShieldCheck className="w-7 h-7 text-[#62ff00]" />
              <h3 className="text-lg font-bold text-white">
                متابعة مستمرة للطلاب وأولياء الأمور
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                نظام متكامل لمتابعة حالة اشتراك الطالب والمقررات المسجلة مع دعم
                فني سريع للتفعيل والرد على الاستفسارات.
              </p>
            </div>
          </div>
        </section>

        {/* How to Register Steps Section */}
        <section
          id="steps"
          className="max-w-7xl mx-auto px-6 py-14 border-t border-slate-900"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8">
            خطوات التسجيل في دوراتنا
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <span className="text-xs font-bold tabular-nums text-[#62ff00]">
                01. الخطوة الأولى
              </span>
              <h3 className="text-base font-bold text-white">
                إنشاء حساب وتسجيل الدخول
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                قم بإنشاء حساب طالب جديد باستخدام بريدك الإلكتروني ورقم الهاتف
                واختر سنتك وشعبتك الدراسية.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <span className="text-xs font-bold tabular-nums text-[#62ff00]">
                02. الخطوة الثانية
              </span>
              <h3 className="text-base font-bold text-white">
                اختيار الدورة المناسبة
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                تصفح قائمة الدورات المتاحة لصفك الدراسي وتعرف على المدرس وعدد
                المحاضرات وتفاصيل المنهج.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <span className="text-xs font-bold tabular-nums text-[#62ff00]">
                03. الخطوة الثالثة
              </span>
              <h3 className="text-base font-bold text-white">
                تأكيد طلب الاشتراك
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                اضغط على &quot;احجز الآن&quot; وأكمل إجراءات الدفع عبر المحفظة الإلكترونية
                وأرسل التأكيد.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <span className="text-xs font-bold tabular-nums text-[#62ff00]">
                04. الخطوة الرابعة
              </span>
              <h3 className="text-base font-bold text-white">
                مشاهدة المحاضرات فوراً
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                بمجرد تفعيل الاشتراك من الإدارة، ستفتح لك جميع محاضرات الدورة في
                صفحة &quot;كورساتي&quot;.
              </p>
            </div>
          </div>
        </section>
      </main>

      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          userId={user?._id}
        />
      )}

      <Footer />
    </div>
  );
}
