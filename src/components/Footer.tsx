import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      id="footer"
      dir="rtl"
      className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-300 mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-slate-800/80">
          {/* Column 1: About */}
          <div className="space-y-3">
            <Link
              to="/"
              className="text-xl font-extrabold text-white tracking-tight inline-block"
            >
              منصتي التعليمية
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              بيئة تعليمية متكاملة لطلاب المرحلة الثانوية والقدرات، نهدف إلى تقديم
              تأسيس علمي رصين ومحاضرات مصورة عالية الجودة مع متابعة مستمرة
              لضمان تفوق الطلاب.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">روابط سريعة</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-[#62ff00] transition-colors">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="hover:text-[#62ff00] transition-colors"
                >
                  تصفح الدورات
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-[#62ff00] transition-colors"
                >
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="hover:text-[#62ff00] transition-colors"
                >
                  إنشاء حساب طالب
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">الدعم الفني والتواصل</h3>
            <p className="text-sm text-slate-400">
              لتفعيل الاشتراكات أو الاستفسار عن المقررات الدراسية، تواصل معنا عبر
              أرقام الدعم المعتمدة:
            </p>
            <div className="space-y-1 text-sm text-slate-300 tabular-nums">
              <p>
                فودافون كاش: <span className="font-mono" dir="ltr">01011223344</span>
              </p>
              <p>
                واتساب التفعيل: <span className="font-mono" dir="ltr">01122334455</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>جميع الحقوق محفوظة لدى منصتي التعليمية © {new Date().getFullYear()}</p>
          <div className="flex items-center gap-4">
            <Link to="/courses" className="hover:text-slate-300 transition-colors">
              المقررات الدراسية
            </Link>
            <span aria-hidden="true">·</span>
            <a href="#steps" className="hover:text-slate-300 transition-colors">
              طريقة الاشتراك
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
