import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Search } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import CourseDetailsModal from "../components/CourseDetailsModal";
import {
  Course,
  User,
  EnrollmentStatus,
  filterCoursesList,
} from "../utils/platformLogic";

interface CoursesPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange: () => void;
}

export default function CoursesPage({
  user,
  tokenState,
  onAuthChange,
}: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<
    Record<string, EnrollmentStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  const fetchCoursesAndCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }

      const token = Cookies.get("token");
      if (token && user?.role === "Student") {
        const cartRes = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          const map: Record<string, EnrollmentStatus> = {};
          if (Array.isArray(cartData?.courses)) {
            cartData.courses.forEach((item: any) => {
              if (item.course?._id) {
                map[item.course._id] = item.status;
              }
            });
          }
          setUserEnrollments(map);
        }
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndCart();
  }, [user]);

  const filteredCourses = filterCoursesList(courses, {
    search,
    year: yearFilter,
    branch: branchFilter,
    excludeSuspended: true,
  });

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              الكورسات والمقررات الدراسية
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              اختر صفك الدراسي أو ابحث باسم المادة أو المعلم للاشتراك المباشر
            </p>
          </div>
          <div className="text-xs text-slate-400 tabular-nums">
            إجمالي الدورات المتاحة: {filteredCourses.length}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="ابحث عن مادة أو مدرس"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المادة أو المدرس..."
              className="w-full pr-10 pl-4 py-2 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          {/* Year Segmented Buttons */}
          <div className="md:col-span-4 flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
            {[
              { id: "ALL", label: "كل الصفوف" },
              { id: "First", label: "الأول" },
              { id: "Second", label: "الثاني" },
              { id: "Third", label: "الثالث" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setYearFilter(tab.id)}
                className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  yearFilter === tab.id
                    ? "bg-[#62ff00] text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Branch Select */}
          <div className="md:col-span-3">
            <select
              aria-label="تصفية حسب الشعبة"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            >
              <option value="ALL">جميع الشعب والأقسام</option>
              <option value="Scientific_Sciences">علمي علوم</option>
              <option value="Math_Science">علمي رياضة</option>
              <option value="Scientific">علمي (أولى ثانوي)</option>
              <option value="Literary">أدبي</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
            <p className="text-lg font-bold text-white">
              لا توجد دورات مطابقة لخيارات البحث الحالية
            </p>
            <p className="text-xs text-slate-400">
              جرب تغيير الصف الدراسي أو مسح كلمة البحث لعرض جميع المقررات
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setYearFilter("ALL");
                setBranchFilter("ALL");
              }}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#62ff00] rounded-lg hover:bg-[#52d600] cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((courseItem) => (
              <CourseCard
                key={courseItem._id}
                courseItem={courseItem}
                buttonLabel="احجز الآن"
                onButtonClick={handleBookClick}
                userRole={user?.role || "Student"}
                enrollmentStatus={userEnrollments[courseItem._id]}
                onWatchClick={(id) => navigate(`/watch/${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          userId={user?._id}
          onSubscribed={fetchCoursesAndCart}
        />
      )}

      <Footer />
    </div>
  );
}
