import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { LogIn, Shield, UserCheck, GraduationCap } from "lucide-react";
import Header from "../components/Header";
import { User } from "../utils/platformLogic";

interface LoginPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthSuccess: () => Promise<void>;
}

export default function LoginPage({
  user,
  tokenState,
  onAuthSuccess,
}: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError("");
    if (!loginEmail.trim()) {
      setError("الرجاء إدخال البريد الإلكتروني");
      return;
    }
    if (!loginPass.trim() || loginPass.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPass,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "برجاء التأكد من البريد الإلكتروني وكلمة المرور");
        return;
      }

      Cookies.set("token", data.token, { expires: 1 });
      await onAuthSuccess();

      if (data.user?.role === "Admin" || data.user?.role === "Manager") {
        navigate("/coursesdashboard");
      } else {
        navigate("/courses");
      }
    } catch {
      setError("تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthSuccess} />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              تسجيل الدخول إلى منصتي
            </h1>
            <p className="text-xs text-slate-400">
              أدخل بيانات حسابك للوصول إلى محاضراتك أو لوحة الإدارة
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs font-medium"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                البريد الإلكتروني
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                dir="ltr"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                كلمة المرور
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#62ff00] hover:bg-[#52d600] disabled:opacity-50 text-slate-950 font-extrabold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "جاري التحقق..." : "تسجيل الدخول"}</span>
            </button>
          </form>

          {/* Quick Demo Accounts for Instant Testing */}
          <div className="pt-5 border-t border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-400 text-center">
              حسابات جاهزة للتجربة السريعة (بضغطة واحدة):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => performLogin("student@gmail.com", "Student@123")}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-[#62ff00]/60 text-xs font-semibold text-slate-200 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#62ff00]" />
                <span>حساب طالب</span>
              </button>
              <button
                type="button"
                onClick={() => performLogin("admin@gmail.com", "Admin@123")}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-[#62ff00]/60 text-xs font-semibold text-slate-200 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#62ff00]" />
                <span>حساب مدير</span>
              </button>
              <button
                type="button"
                onClick={() => performLogin("manager@gmail.com", "Manager@123")}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-[#62ff00]/60 text-xs font-semibold text-slate-200 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#62ff00]" />
                <span>حساب مشرف</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
            ليس لديك حساب؟{" "}
            <Link to="/signup" className="text-[#62ff00] font-bold hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
