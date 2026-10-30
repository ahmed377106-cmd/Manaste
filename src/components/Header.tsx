import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Menu, X, LogOut } from "lucide-react";
import { User } from "../utils/platformLogic";

interface HeaderProps {
  user: User | null;
  tokenState: boolean;
  onAuthChange?: () => void;
}

export default function Header({ user, tokenState, onAuthChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isStaff =
    tokenState && user && (user.role === "Admin" || user.role === "Manager");
  const isStudent = tokenState && user && user.role === "Student";

  const handleLogout = () => {
    Cookies.remove("token");
    setMobileMenuOpen(false);
    if (onAuthChange) {
      onAuthChange();
    }
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
      isActive(path)
        ? "text-[#62ff00] border-[#62ff00]"
        : "text-slate-300 border-transparent hover:text-white hover:border-slate-600"
    }`;

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight text-white hover:text-[#62ff00] transition-colors whitespace-nowrap shrink-0"
        >
          منصتي التعليمية
        </Link>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-7"
        >
          <Link to="/" className={navLinkClass("/")}>
            الرئيسية
          </Link>

          {isStaff ? (
            <>
              <Link
                to="/coursesdashboard"
                className={navLinkClass("/coursesdashboard")}
              >
                إدارة الكورسات
              </Link>
              <Link to="/orders" className={navLinkClass("/orders")}>
                الطلبات
              </Link>
              <Link to="/students" className={navLinkClass("/students")}>
                الطلاب
              </Link>
              <Link to="/managers" className={navLinkClass("/managers")}>
                المشرفين
              </Link>
            </>
          ) : (
            <>
              <Link to="/courses" className={navLinkClass("/courses")}>
                الكورسات
              </Link>
              {isStudent && user && (
                <Link
                  to={`/courses/${user._id}`}
                  className={navLinkClass(`/courses/${user._id}`)}
                >
                  كورساتي
                </Link>
              )}
              <a
                href="/#steps"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent"
              >
                خطوات التسجيل
              </a>
              <a
                href="/#footer"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent"
              >
                تواصل معنا
              </a>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {tokenState && user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="text-sm text-slate-300 hover:text-[#62ff00] transition-colors whitespace-nowrap shrink-0"
              >
                مرحباً، <strong className="text-white">{user.name}</strong>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="تسجيل الخروج"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-300 bg-red-950/50 border border-red-800/60 rounded-lg hover:bg-red-900/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل خروج</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/signup"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                حساب جديد
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-slate-950 bg-[#62ff00] rounded-lg hover:bg-[#52d600] transition-colors whitespace-nowrap shrink-0"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={mobileMenuOpen}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-6 py-4 space-y-3">
          {tokenState && user && (
            <div className="pb-3 mb-2 border-b border-slate-800 flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:opacity-80"
              >
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </Link>
              <span className="text-xs text-[#62ff00]">
                {user.role === "Admin"
                  ? "مدير المنصة"
                  : user.role === "Manager"
                  ? "مشرف إداري"
                  : "طالب"}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-medium text-slate-200 hover:text-[#62ff00]"
            >
              الرئيسية
            </Link>

            {isStaff ? (
              <>
                <Link
                  to="/coursesdashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-slate-200 hover:text-[#62ff00]"
                >
                  إدارة الكورسات
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-slate-200 hover:text-[#62ff00]"
                >
                  الطلبات المنتظرة
                </Link>
                <Link
                  to="/students"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-slate-200 hover:text-[#62ff00]"
                >
                  إدارة الطلاب
                </Link>
                <Link
                  to="/managers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-slate-200 hover:text-[#62ff00]"
                >
                  إدارة المشرفين
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/courses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-slate-200 hover:text-[#62ff00]"
                >
                  الكورسات المتاحة
                </Link>
                {isStudent && user && (
                  <Link
                    to={`/courses/${user._id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-sm font-medium text-slate-200 hover:text-[#62ff00]"
                  >
                    كورساتي المشترك بها
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {tokenState && user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 text-sm font-semibold text-red-300 bg-red-950/50 border border-red-800/60 rounded-lg"
              >
                تسجيل خروج
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-slate-950 bg-[#62ff00] rounded-lg"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-200 border border-slate-700 rounded-lg"
                >
                  إنشاء حساب جديد
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
