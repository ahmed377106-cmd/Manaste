import React, { useState } from "react";
import { BookOpen, PlayCircle, Lock } from "lucide-react";
import {
  Course,
  EnrollmentStatus,
  translateYear,
  translateTerm,
  translateBranch,
  translateStatus,
} from "../utils/platformLogic";

interface CourseCardProps {
  courseItem: Course;
  buttonLabel?: string;
  onButtonClick: (course: Course) => void;
  userRole?: string;
  enrollmentStatus?: EnrollmentStatus;
  onWatchClick?: (courseId: string) => void;
}

export default function CourseCard({
  courseItem,
  buttonLabel = "احجز الآن",
  onButtonClick,
  userRole = "Student",
  enrollmentStatus,
  onWatchClick,
}: CourseCardProps) {
  const [imgError, setImgError] = useState(false);

  const isStaff = userRole === "Admin" || userRole === "Manager";
  const lectureCount = courseItem.listOfLec?.length || 0;

  return (
    <article
      dir="rtl"
      className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors overflow-hidden"
    >
      <div>
        {/* Image / Fallback Cover */}
        <div className="relative aspect-[4/3] w-full bg-slate-800/80 overflow-hidden border-b border-slate-800/80">
          {!imgError && courseItem.teacherImg ? (
            <img
              src={courseItem.teacherImg}
              alt={`${courseItem.subject} - ${courseItem.teacher}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 p-4 text-center">
              <BookOpen className="w-10 h-10 text-[#62ff00] mb-2" />
              <span className="text-sm font-bold text-slate-200">
                {courseItem.subject}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-slate-300 font-medium">
                {courseItem.teacher}
              </p>
              <h3 className="text-lg font-bold text-white leading-snug">
                {courseItem.subject}
              </h3>
            </div>
            {courseItem.price && (
              <span className="text-sm font-bold text-[#62ff00] tabular-nums shrink-0">
                {courseItem.price} ج.م
              </span>
            )}
          </div>
        </div>

        {/* Metadata & Description (Zero-Pill Unboxed Text) */}
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>{translateYear(courseItem.year)}</span>
            <span aria-hidden="true">·</span>
            <span>{translateBranch(courseItem.branch)}</span>
            <span aria-hidden="true">·</span>
            <span>{translateTerm(courseItem.term)}</span>
          </div>

          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
            {courseItem.description}
          </p>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
            <span className="tabular-nums">
              عدد المحاضرات: <strong className="text-slate-200">{lectureCount}</strong>
            </span>
            {enrollmentStatus && (
              <span
                className={
                  enrollmentStatus === "Accepted"
                    ? "text-emerald-400 font-semibold"
                    : enrollmentStatus === "Rejected"
                    ? "text-red-400 font-semibold"
                    : "text-amber-400 font-semibold"
                }
              >
                {translateStatus(enrollmentStatus)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-2">
        {enrollmentStatus === "Accepted" && onWatchClick ? (
          <button
            type="button"
            onClick={() => onWatchClick(courseItem._id)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#62ff00] hover:bg-[#52d600] text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>مشاهدة المحاضرات</span>
          </button>
        ) : enrollmentStatus === "Waiting" ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 text-amber-300 font-semibold text-sm border border-amber-500/30 cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Lock className="w-4 h-4" />
            <span>قيد مراجعة التفعيل</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onButtonClick(courseItem)}
            disabled={isStaff}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              isStaff
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-[#62ff00] hover:bg-[#52d600] text-slate-950 cursor-pointer"
            }`}
          >
            {isStaff ? "مخصص للطلاب" : buttonLabel}
          </button>
        )}
      </div>
    </article>
  );
}
