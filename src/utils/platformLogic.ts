export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Student";
  blocked?: boolean;
  year?: "First" | "Second" | "Third";
  branch?: "Scientific" | "Literary" | "Math_Science" | "Scientific_Sciences";
  phone: string;
  fatherPhone?: string;
  createdAt?: string;
}

export interface Course {
  _id: string;
  subject: string;
  year: "First" | "Second" | "Third";
  term: "First" | "Second";
  teacher: string;
  teacherImg: string;
  listOfLec: string[];
  suspend: boolean;
  description: string;
  branch: "Scientific" | "Literary" | "Math_Science" | "Scientific_Sciences";
  price?: number;
  createdAt?: string;
}

export type EnrollmentStatus =
  | "Waiting"
  | "Accepted"
  | "Rejected"
  | "WaitingNextPayment";

export interface CartCourseItem {
  _id: string;
  course: Course;
  status: EnrollmentStatus;
  dateAdded: string;
  completedLectures?: number[];
}

export interface Cart {
  _id: string;
  user: User;
  courses: CartCourseItem[];
  createdAt?: string;
}

export interface WaitingOrder {
  cartId: string;
  user: User;
  course: Course;
  status: EnrollmentStatus;
  dateAdded?: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title?: string;
  description?: string;
  message?: string;
  type?: "success" | "update" | "error" | "warning";
  link?: string;
  seen: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  blockedStudents: number;
  totalStaff: number;
  totalCourses: number;
  activeCourses: number;
  suspendedCourses: number;
  totalLectures: number;
  waitingOrders: number;
  acceptedEnrollments: number;
  rejectedEnrollments: number;
  estimatedRevenue: number;
}

export const YEAR_LABELS: Record<string, string> = {
  First: "الصف الأول الثانوي",
  Second: "الصف الثاني الثانوي",
  Third: "الصف الثالث الثانوي",
};

export const TERM_LABELS: Record<string, string> = {
  First: "الفصل الدراسي الأول",
  Second: "الفصل الدراسي الثاني",
};

export const BRANCH_LABELS: Record<string, string> = {
  Scientific: "علمي",
  Literary: "أدبي",
  Scientific_Sciences: "علمي علوم",
  Math_Science: "علمي رياضة",
};

export const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  Accepted: "مقبول (مفعل)",
  Waiting: "في انتظار التفعيل",
  Rejected: "مرفوض",
  WaitingNextPayment: "في انتظار تجديد الاشتراك",
};

export function translateYear(year?: string): string {
  if (!year) return "غير محدد";
  return YEAR_LABELS[year] || year;
}

export function translateTerm(term?: string): string {
  if (!term) return "غير محدد";
  return TERM_LABELS[term] || term;
}

export function translateBranch(branch?: string): string {
  if (!branch) return "غير محدد";
  return BRANCH_LABELS[branch] || branch;
}

export function translateStatus(status: EnrollmentStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getBranchesForYear(
  year: string
): Array<{ value: string; label: string }> {
  if (year === "First") {
    return [
      { value: "Scientific", label: "علمي" },
      { value: "Literary", label: "أدبي" },
    ];
  }
  if (year === "Second" || year === "Third") {
    return [
      { value: "Scientific_Sciences", label: "علمي علوم" },
      { value: "Math_Science", label: "علمي رياضة" },
      { value: "Literary", label: "أدبي" },
    ];
  }
  return [];
}

export interface ParsedVideoLink {
  type: "youtube" | "drive" | "mediadelivery" | "direct" | "invalid";
  embedUrl: string | null;
}

export function parseVideoLink(url?: string | null): ParsedVideoLink {
  if (!url || typeof url !== "string" || !url.trim()) {
    return { type: "invalid", embedUrl: null };
  }
  const trimmed = url.trim();

  // Check YouTube watch, embed, shorts, or youtu.be
  if (
    trimmed.includes("youtube.com") ||
    trimmed.includes("youtu.be")
  ) {
    let videoId: string | null = null;
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1).split("/")[0];
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0];
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
      } else {
        videoId = parsed.searchParams.get("v");
      }
    } catch {
      const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
      videoId = match ? match[1] : null;
    }

    if (videoId) {
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      };
    }
  }

  // Check Google Drive
  if (trimmed.includes("drive.google.com")) {
    const idMatch = trimmed.match(/\/d\/([^/]+)(?:\/|$)/);
    if (idMatch && idMatch[1]) {
      return {
        type: "drive",
        embedUrl: `https://drive.google.com/file/d/${idMatch[1]}/preview`,
      };
    }
  }

  // Check MediaDelivery
  if (trimmed.includes("iframe.mediadelivery.net")) {
    return {
      type: "mediadelivery",
      embedUrl: trimmed,
    };
  }

  // Direct MP4 / WebM video URL
  if (/^https?:\/\/.+\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
    return {
      type: "direct",
      embedUrl: trimmed,
    };
  }

  return { type: "invalid", embedUrl: null };
}

export function validateCourseInput(input: {
  subject?: string;
  year?: string;
  term?: string;
  teacher?: string;
  description?: string;
  branch?: string;
}): { valid: boolean; error?: string } {
  const { subject, year, term, teacher, description, branch } = input;
  if (!subject || !year || !term || !teacher || !description || !branch) {
    return { valid: false, error: "جميع الحقول مطلوبة" };
  }
  if (subject.trim().length < 3) {
    return { valid: false, error: "يجب ألا يقل اسم المادة عن 3 حروف" };
  }
  if (!["First", "Second", "Third"].includes(year)) {
    return { valid: false, error: "يجب اختيار السنة الدراسية بشكل صحيح" };
  }
  if (!["First", "Second"].includes(term)) {
    return { valid: false, error: "يجب اختيار الفصل الدراسي بشكل صحيح" };
  }
  if (teacher.trim().length < 5) {
    return { valid: false, error: "يجب ألا يقل اسم المدرس عن 5 حروف" };
  }
  if (description.trim().length < 10) {
    return { valid: false, error: "يجب ألا يقل وصف الدورة عن 10 حروف" };
  }
  if (
    !["Scientific", "Literary", "Math_Science", "Scientific_Sciences"].includes(
      branch
    )
  ) {
    return {
      valid: false,
      error: "يجب أن تكون الشعبة علمي أو أدبي أو علمي علوم أو علمي رياضة",
    };
  }
  return { valid: true };
}

export function validateStudentSignup(input: {
  name?: string;
  email?: string;
  password?: string;
  branch?: string;
  year?: string;
  phone?: string;
  fatherPhone?: string;
}): { valid: boolean; error?: string } {
  const { name, email, password, branch, year, phone, fatherPhone } = input;
  if (
    !name ||
    !email ||
    !password ||
    !branch ||
    !year ||
    !phone ||
    !fatherPhone
  ) {
    return { valid: false, error: "جميع الحقول مطلوبة" };
  }
  if (name.trim().length < 6) {
    return { valid: false, error: "يجب ألا يقل الاسم عن 6 حروف" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { valid: false, error: "يرجى إدخال بريد إلكتروني صحيح" };
  }
  const passwordComplexityRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.~`])[A-Za-z\d@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.~`]{8,}$/;
  if (!passwordComplexityRegex.test(password)) {
    return {
      valid: false,
      error:
        "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وتحتوي على حرف كبير، حرف صغير، رقم، ورمز خاص (مثل @ أو # أو !)",
    };
  }
  if (
    !["Scientific", "Literary", "Math_Science", "Scientific_Sciences"].includes(
      branch
    )
  ) {
    return {
      valid: false,
      error: "يجب اختيار الشعبة الدراسية بشكل صحيح",
    };
  }
  if (!["First", "Second", "Third"].includes(year)) {
    return { valid: false, error: "يجب اختيار السنة الدراسية بشكل صحيح" };
  }
  const phoneRegex = /^01\d{9}$/;
  if (!phoneRegex.test(phone.trim())) {
    return {
      valid: false,
      error: "برجاء إدخال رقم هاتف صحيح مكون من 11 رقماً يبدأ بـ 01",
    };
  }
  if (!phoneRegex.test(fatherPhone.trim())) {
    return {
      valid: false,
      error: "برجاء إدخال رقم هاتف ولي الأمر مكون من 11 رقماً يبدأ بـ 01",
    };
  }
  return { valid: true };
}

export function filterCoursesList(
  courses: Course[],
  filters: {
    search?: string;
    year?: string;
    branch?: string;
    term?: string;
    excludeSuspended?: boolean;
  }
): Course[] {
  return courses.filter((course) => {
    if (filters.excludeSuspended && course.suspend) {
      return false;
    }
    if (filters.year && filters.year !== "ALL" && course.year !== filters.year) {
      return false;
    }
    if (
      filters.branch &&
      filters.branch !== "ALL" &&
      course.branch !== filters.branch
    ) {
      return false;
    }
    if (filters.term && filters.term !== "ALL" && course.term !== filters.term) {
      return false;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const matchSubject = course.subject.toLowerCase().includes(q);
      const matchTeacher = course.teacher.toLowerCase().includes(q);
      const matchDesc = course.description.toLowerCase().includes(q);
      if (!matchSubject && !matchTeacher && !matchDesc) {
        return false;
      }
    }
    return true;
  });
}
