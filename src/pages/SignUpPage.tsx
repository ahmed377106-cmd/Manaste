import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { UserPlus } from "lucide-react";
import Header from "../components/Header";
import {
  User,
  getBranchesForYear,
  validateStudentSignup,
} from "../utils/platformLogic";

interface SignUpPageProps {
  user: User | null;
  tokenState: boolean;
  onAuthSuccess: () => Promise<void>;
}

export default function SignUpPage({
  user,
  tokenState,
  onAuthSuccess,
}: SignUpPageProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordRepeat: "",
    year: "",
    branch: "",
    phone: "",
    fatherPhone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const availableBranches = getBranchesForYear(formData.year);

  const handleYearChange = (yearVal: string) => {
    setFormData((prev) => ({ ...prev, year: yearVal, branch: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.passwordRepeat) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    const validation = validateStudentSignup(formData);
    if (!validation.valid) {
      setError(validation.error || "يرجى التأكد من صحة جميع البيانات");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          year: formData.year,
          branch: formData.branch,
          phone: formData.phone.trim(),
          fatherPhone: formData.fatherPhone.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "حدث خطأ أثناء إنشاء الحساب");
        return;
      }

      Cookies.set("token", data.token, { expires: 1 });
      await onAuthSuccess();
      navigate("/courses");
    } catch {
      setError("تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header user={user} tokenState={tokenState} onAuthChange={onAuthSuccess} />

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-extrabold text-white">
              إنشاء حساب طالب جديد
            </h1>
            <p className="text-xs text-slate-400">
              سجل بياناتك للانضمام إلى المنصة والاشتراك في المقررات الدراسية
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs font-medium leading-relaxed"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  الاسم الثلاثي (6 أحرف على الأقل)
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="مثال: يوسف محمد علي"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="student@gmail.com"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  كلمة المرور (حرف كبير، صغير، رقم، رمز @)
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Student@123"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password-repeat"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  تأكيد كلمة المرور
                </label>
                <input
                  id="signup-password-repeat"
                  type="password"
                  value={formData.passwordRepeat}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordRepeat: e.target.value })
                  }
                  placeholder="Student@123"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-year"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  السنة الدراسية
                </label>
                <select
                  id="signup-year"
                  value={formData.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
                >
                  <option value="">اختر السنة الدراسية</option>
                  <option value="First">الصف الأول الثانوي</option>
                  <option value="Second">الصف الثاني الثانوي</option>
                  <option value="Third">الصف الثالث الثانوي</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="signup-branch"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  الشعبة الدراسية
                </label>
                <select
                  id="signup-branch"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  disabled={!formData.year}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white disabled:opacity-50 focus:border-[#62ff00] focus:outline-none"
                >
                  <option value="">اختر القسم / الشعبة</option>
                  {availableBranches.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-phone"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  رقم هاتف الطالب (11 رقماً يبدأ بـ 01)
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="01012345678"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white font-mono tabular-nums focus:border-[#62ff00] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-father-phone"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  رقم هاتف ولي الأمر (11 رقماً يبدأ بـ 01)
                </label>
                <input
                  id="signup-father-phone"
                  type="tel"
                  value={formData.fatherPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, fatherPhone: e.target.value })
                  }
                  placeholder="01112345678"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white font-mono tabular-nums focus:border-[#62ff00] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#62ff00] hover:bg-[#52d600] disabled:opacity-50 text-slate-950 font-extrabold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-[#62ff00] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
