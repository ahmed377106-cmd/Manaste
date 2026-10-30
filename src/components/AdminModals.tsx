import React, { useState } from "react";
import Cookies from "js-cookie";
import { X, Plus, Trash2, Video, ExternalLink } from "lucide-react";
import {
  Course,
  getBranchesForYear,
  validateCourseInput,
} from "../utils/platformLogic";

interface CourseFormModalProps {
  mode: "add" | "edit";
  course?: Course | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CourseFormModal({
  mode,
  course,
  onClose,
  onSaved,
}: CourseFormModalProps) {
  const [subject, setSubject] = useState(course?.subject || "");
  const [teacher, setTeacher] = useState(course?.teacher || "");
  const [teacherImg, setTeacherImg] = useState(course?.teacherImg || "");
  const [year, setYear] = useState<string>(course?.year || "");
  const [branch, setBranch] = useState<string>(course?.branch || "");
  const [term, setTerm] = useState<string>(course?.term || "");
  const [price, setPrice] = useState<string>(
    course?.price ? String(course.price) : "200"
  );
  const [suspend, setSuspend] = useState<boolean>(course?.suspend || false);
  const [description, setDescription] = useState(course?.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const availableBranches = getBranchesForYear(year);

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    setBranch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = validateCourseInput({
      subject,
      year,
      term,
      teacher,
      description,
      branch,
    });

    if (!validation.valid) {
      setError(validation.error || "يرجى التحقق من جميع الحقول");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "edit" && course
          ? `/api/courses/${course._id}`
          : "/api/courses";
      const method = mode === "edit" ? "PUT" : "POST";

      const token = Cookies.get("token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject,
          teacher,
          teacherImg,
          year,
          branch,
          term,
          price: Number(price) || 200,
          suspend,
          description,
          listOfLec: course?.listOfLec || [],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "حدث خطأ أثناء حفظ الكورس");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <h2 id="course-form-title" className="text-xl font-bold text-white">
            {mode === "add" ? "إضافة كورس جديد" : "تعديل بيانات الكورس"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="course-subject"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              اسم المادة / الكورس
            </label>
            <input
              id="course-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: الفيزياء الكهربية والحديثة"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="course-teacher"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                اسم المدرس
              </label>
              <input
                id="course-teacher"
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="مثال: د. محمود الكيلاني"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="course-price"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                سعر الاشتراك (ج.م)
              </label>
              <input
                id="course-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white font-mono tabular-nums focus:border-[#62ff00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="course-img"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              رابط صورة المدرس أو الكورس (اختياري)
            </label>
            <input
              id="course-img"
              type="text"
              value={teacherImg}
              onChange={(e) => setTeacherImg(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="course-year"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                السنة الدراسية
              </label>
              <select
                id="course-year"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
              >
                <option value="">اختر السنة</option>
                <option value="First">الصف الأول الثانوي</option>
                <option value="Second">الصف الثاني الثانوي</option>
                <option value="Third">الصف الثالث الثانوي</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="course-branch"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                الشعبة الدراسية
              </label>
              <select
                id="course-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={!year}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white disabled:opacity-50 focus:border-[#62ff00] focus:outline-none"
              >
                <option value="">اختر الشعبة</option>
                {availableBranches.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="course-term"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                الفصل الدراسي
              </label>
              <select
                id="course-term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
              >
                <option value="">اختر الفصل</option>
                <option value="First">الفصل الأول</option>
                <option value="Second">الفصل الثاني</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="course-status"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              حالة الكورس
            </label>
            <select
              id="course-status"
              value={suspend ? "true" : "false"}
              onChange={(e) => setSuspend(e.target.value === "true")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            >
              <option value="false">نشط ومتاح للطلاب</option>
              <option value="true">معلق مؤقتاً</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="course-desc"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              وصف الكورس والمحتوى العلمي
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً واضحاً لمحتوى الكورس (10 أحرف على الأقل)..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-bold text-slate-950 bg-[#62ff00] hover:bg-[#52d600] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {saving ? "جاري الحفظ..." : "حفظ البيانات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LectureCourseModalProps {
  course: Course | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function LectureCourseModal({
  course,
  onClose,
  onUpdated,
}: LectureCourseModalProps) {
  const [newLectureLink, setNewLectureLink] = useState("");
  const [lectures, setLectures] = useState<string[]>(course?.listOfLec || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!course) return null;

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLectureLink.trim()) {
      setError("يرجى إدخال رابط المحاضرة (YouTube أو Google Drive)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/courses/${course._id}/add-lecture`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lectureLink: newLectureLink.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "فشل إضافة المحاضرة");
        return;
      }
      setLectures(data.course.listOfLec);
      setNewLectureLink("");
      onUpdated();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (index: number) => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `/api/courses/${course._id}/lectures/${index}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLectures(data.course.listOfLec);
        onUpdated();
      }
    } catch {
      setError("فشل حذف المحاضرة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lectures-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#62ff00]" />
            <h2 id="lectures-modal-title" className="text-lg font-bold text-white">
              محاضرات: {course.subject}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAddLecture} className="space-y-2">
          <label
            htmlFor="new-lecture-url"
            className="block text-xs font-semibold text-slate-300"
          >
            إضافة رابط محاضرة جديدة (YouTube أو Google Drive)
          </label>
          <div className="flex gap-2">
            <input
              id="new-lecture-url"
              type="text"
              value={newLectureLink}
              onChange={(e) => setNewLectureLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              dir="ltr"
              className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-slate-950 bg-[#62ff00] hover:bg-[#52d600] rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400">
            قائمة المحاضرات الحالية ({lectures.length})
          </h3>
          {lectures.length === 0 ? (
            <div className="p-6 text-center rounded-lg border border-slate-800 bg-slate-950/50 text-slate-400 text-sm">
              لا توجد محاضرات مضافة لهذا الكورس حتى الآن
            </div>
          ) : (
            <ul className="space-y-2">
              {lectures.map((lec, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/70 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-[#62ff00] font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="truncate text-slate-300 text-xs" dir="ltr">
                      {lec}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={lec}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`فتح المحاضرة ${idx + 1}`}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteLecture(idx)}
                      aria-label={`حذف المحاضرة ${idx + 1}`}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseName: string;
  teacherName: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  courseName,
  teacherName,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 id="confirm-delete-title" className="text-lg font-bold text-white">
            تأكيد حذف الكورس
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          هل أنت متأكد أنك تريد حذف دورة{" "}
          <strong className="text-[#62ff00]">{courseName}</strong> التي يدرسها{" "}
          <strong className="text-white">{teacherName}</strong>؟ لا يمكن التراجع
          عن هذا الإجراء.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddManagerModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function AddManagerModal({ onClose, onSaved }: AddManagerModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"Manager" | "Admin">("Manager");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !phone) {
      setError("جميع الحقول مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/auth/addadmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "فشل في إضافة المشرف");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h2 id="add-manager-title" className="text-lg font-bold text-white">
            إضافة مشرف أو مسؤول جديد
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="manager-name"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              الاسم الكامل (6 حروف على الأقل)
            </label>
            <input
              id="manager-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أ. خالد عبد العزيز"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="manager-email"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              البريد الإلكتروني
            </label>
            <input
              id="manager-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager2@gmail.com"
              dir="ltr"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="manager-password"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              كلمة المرور (حرف كبير، صغير، رقم، ورمز مثل @)
            </label>
            <input
              id="manager-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Manager@123"
              dir="ltr"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="manager-phone"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              رقم الهاتف (11 رقماً يبدأ بـ 01)
            </label>
            <input
              id="manager-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              dir="ltr"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white font-mono tabular-nums focus:border-[#62ff00] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="manager-role"
              className="block text-xs font-semibold text-slate-300 mb-1.5"
            >
              الصلاحية
            </label>
            <select
              id="manager-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "Manager" | "Admin")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-950 text-white focus:border-[#62ff00] focus:outline-none"
            >
              <option value="Manager">مشرف إداري (متابعة الطلاب والطلبات)</option>
              <option value="Admin">مدير كامل الصلاحيات</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-bold text-slate-950 bg-[#62ff00] hover:bg-[#52d600] disabled:opacity-50 rounded-lg cursor-pointer"
            >
              {saving ? "جاري الحفظ..." : "إضافة المشرف"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
