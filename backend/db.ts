import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { EnrollmentStatus } from "../src/utils/platformLogic";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "..", ".data", "store.json");

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Student";
  blocked: boolean;
  year?: "First" | "Second" | "Third";
  branch?: "Scientific" | "Literary" | "Math_Science" | "Scientific_Sciences";
  phone: string;
  fatherPhone?: string;
  createdAt: string;
}

export interface StoredCourse {
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
  price: number;
  createdAt: string;
}

export interface StoredCartCourse {
  _id: string;
  courseId: string;
  status: EnrollmentStatus;
  dateAdded: string;
  completedLectures?: number[];
}

export interface StoredCart {
  _id: string;
  userId: string;
  courses: StoredCartCourse[];
  createdAt: string;
}

export interface StoredNotification {
  _id: string;
  userId: string;
  title: string;
  description: string;
  type: "success" | "update" | "error" | "warning";
  seen: boolean;
  link: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  courses: StoredCourse[];
  carts: StoredCart[];
  notifications: StoredNotification[];
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

async function createInitialSeedData(): Promise<DatabaseSchema> {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("Admin@123", salt);
  const managerPassword = await bcrypt.hash("Manager@123", salt);
  const studentPassword = await bcrypt.hash("Student@123", salt);

  const users: StoredUser[] = [
    {
      _id: "usr_admin_1",
      name: "د. أحمد عز الدين",
      email: "admin@gmail.com",
      password: adminPassword,
      role: "Admin",
      blocked: false,
      phone: "01011223344",
      createdAt: "2026-01-10T10:00:00.000Z",
    },
    {
      _id: "usr_manager_1",
      name: "أ. سارة عبد الرحمن",
      email: "manager@gmail.com",
      password: managerPassword,
      role: "Manager",
      blocked: false,
      phone: "01122334455",
      createdAt: "2026-02-14T12:00:00.000Z",
    },
    {
      _id: "usr_student_1",
      name: "يوسف محمد الشناوي",
      email: "student@gmail.com",
      password: studentPassword,
      role: "Student",
      blocked: false,
      year: "Third",
      branch: "Scientific_Sciences",
      phone: "01099887766",
      fatherPhone: "01055443322",
      createdAt: "2026-03-01T09:30:00.000Z",
    },
    {
      _id: "usr_student_2",
      name: "مريم طارق المنصوري",
      email: "mariam@gmail.com",
      password: studentPassword,
      role: "Student",
      blocked: false,
      year: "Third",
      branch: "Math_Science",
      phone: "01233445566",
      fatherPhone: "01277889900",
      createdAt: "2026-03-05T14:20:00.000Z",
    },
    {
      _id: "usr_student_3",
      name: "عمر خالد الدسوقي",
      email: "omar@gmail.com",
      password: studentPassword,
      role: "Student",
      blocked: false,
      year: "First",
      branch: "Scientific",
      phone: "01566778899",
      fatherPhone: "01511223344",
      createdAt: "2026-03-12T16:45:00.000Z",
    },
  ];

  const courses: StoredCourse[] = [
    {
      _id: "crs_physics_3",
      subject: "الفيزياء الكهربية والحديثة",
      year: "Third",
      term: "First",
      teacher: "د. محمود الكيلاني",
      teacherImg:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Mahmoud&backgroundColor=b6e3f4",
      listOfLec: [
        "https://www.youtube.com/watch?v=Unzc731iCUY",
        "https://www.youtube.com/watch?v=ZM8ECpBuQYE",
        "https://www.youtube.com/watch?v=b1t41Q3xRM8",
        "https://www.youtube.com/watch?v=7kb1VT0J3DE",
      ],
      suspend: false,
      description:
        "تأسيس شامل في التيار الكهربي وقانون أوم وقوانين كيرشوف مع حل تدريبات المستويات العليا والامتحانات السابقة.",
      branch: "Scientific_Sciences",
      price: 250,
      createdAt: "2026-01-15T10:00:00.000Z",
    },
    {
      _id: "crs_chemistry_3",
      subject: "الكيمياء العضوية والعناصر الانتقالية",
      year: "Third",
      term: "First",
      teacher: "أ. نبيل الشافعي",
      teacherImg:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Nabil&backgroundColor=c0aede",
      listOfLec: [
        "https://www.youtube.com/watch?v=FSyAehMdpyI",
        "https://www.youtube.com/watch?v=0RRVV4Diomg",
        "https://www.youtube.com/watch?v=k3rRrl9J2F4",
      ],
      suspend: false,
      description:
        "شرح تفصيلي للعناصر الانتقالية ومعادلات الحديد والتحليل الكيميائي مع مراجعات دورية واختبارات تفاعلية.",
      branch: "Scientific_Sciences",
      price: 220,
      createdAt: "2026-01-18T10:00:00.000Z",
    },
    {
      _id: "crs_calculus_3",
      subject: "التفاضل والتكامل المتقدم",
      year: "Third",
      term: "First",
      teacher: "أ. سامح عبد العزيز",
      teacherImg:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Sameh&backgroundColor=d1d4f9",
      listOfLec: [
        "https://www.youtube.com/watch?v=WUvTyaaNkzM",
        "https://www.youtube.com/watch?v=rfG8ce4nNh0",
        "https://www.youtube.com/watch?v=9vKqVkMQHKk",
      ],
      suspend: false,
      description:
        "إتقان الاشتقاق الضمني والبارامتري وتطبيقات القيم العظمى والصغرى والتكامل المحدد والمساحات.",
      branch: "Math_Science",
      price: 240,
      createdAt: "2026-01-20T10:00:00.000Z",
    },
    {
      _id: "crs_english_2",
      subject: "اللغة الإنجليزية والمهارات اللغوية",
      year: "Second",
      term: "First",
      teacher: "أ. طارق الجندي",
      teacherImg:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Tarek&backgroundColor=ffd5dc",
      listOfLec: [
        "https://www.youtube.com/watch?v=jul2urONzOQ",
        "https://www.youtube.com/watch?v=Lr1T1k3W2zU",
      ],
      suspend: false,
      description:
        "إتقان القواعد اللغوية والترجمة الاحترافية وكتابة المقال الأكاديمي والتدريب على قطع الفهم المتقدمة.",
      branch: "Scientific_Sciences",
      price: 180,
      createdAt: "2026-01-25T10:00:00.000Z",
    },
    {
      _id: "crs_arabic_1",
      subject: "اللغة العربية والقدرات اللفظية",
      year: "First",
      term: "First",
      teacher: "د. حسن البناوي",
      teacherImg:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Hassan&backgroundColor=ffdfbf",
      listOfLec: [
        "https://www.youtube.com/watch?v=Unzc731iCUY",
        "https://www.youtube.com/watch?v=WUvTyaaNkzM",
      ],
      suspend: false,
      description:
        "تأسيس متكامل في النحو والبلاغة والأدب مع تدريبات شاملة على استيعاب المقروء والتناظر اللفظي.",
      branch: "Scientific",
      price: 190,
      createdAt: "2026-02-01T10:00:00.000Z",
    },
    {
      _id: "crs_history_3",
      subject: "التاريخ الحديث والمعاصر",
      year: "Third",
      term: "Second",
      teacher: "أ. إبراهيم السعيد",
      teacherImg:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=Ibrahim&backgroundColor=c0aede",
      listOfLec: [
        "https://www.youtube.com/watch?v=Yocja_N5s1I",
        "https://www.youtube.com/watch?v=cdWefN35M30",
      ],
      suspend: false,
      description:
        "تحليل شامل لأحداث التاريخ الحديث وبناء الدولة الحديثة مع ربط الأحداث التاريخية والخرائط الذهنية.",
      branch: "Literary",
      price: 200,
      createdAt: "2026-02-05T10:00:00.000Z",
    },
  ];

  const carts: StoredCart[] = [
    {
      _id: "cart_student_1",
      userId: "usr_student_1",
      courses: [
        {
          _id: "cc_1",
          courseId: "crs_physics_3",
          status: "Accepted",
          dateAdded: "2026-03-02T10:00:00.000Z",
          completedLectures: [0],
        },
        {
          _id: "cc_2",
          courseId: "crs_chemistry_3",
          status: "Waiting",
          dateAdded: "2026-03-04T12:00:00.000Z",
          completedLectures: [],
        },
      ],
      createdAt: "2026-03-02T10:00:00.000Z",
    },
    {
      _id: "cart_student_2",
      userId: "usr_student_2",
      courses: [
        {
          _id: "cc_3",
          courseId: "crs_calculus_3",
          status: "Waiting",
          dateAdded: "2026-03-06T15:30:00.000Z",
          completedLectures: [],
        },
        {
          _id: "cc_4",
          courseId: "crs_physics_3",
          status: "Accepted",
          dateAdded: "2026-03-05T14:30:00.000Z",
          completedLectures: [0, 1],
        },
      ],
      createdAt: "2026-03-05T14:30:00.000Z",
    },
    {
      _id: "cart_student_3",
      userId: "usr_student_3",
      courses: [
        {
          _id: "cc_5",
          courseId: "crs_arabic_1",
          status: "WaitingNextPayment",
          dateAdded: "2026-03-13T11:00:00.000Z",
          completedLectures: [],
        },
      ],
      createdAt: "2026-03-13T11:00:00.000Z",
    },
  ];

  const notifications: StoredNotification[] = [
    {
      _id: "noti_1",
      userId: "usr_student_1",
      title: "تم تفعيل اشتراكك بنجاح",
      description: "تم قبول وتفعيل اشتراكك في كورس الفيزياء الكهربية والحديثة. يمكنك مشاهدة المحاضرات الآن.",
      type: "success",
      seen: false,
      link: "/watch/crs_physics_3",
      createdAt: "2026-03-03T10:00:00.000Z",
    },
    {
      _id: "noti_2",
      userId: "usr_student_1",
      title: "طلب اشتراك قيد المراجعة",
      description: "تم استلام طلب اشتراكك في الكيمياء العضوية والعناصر الانتقالية وجاري مراجعته من الإدارة.",
      type: "update",
      seen: false,
      link: "/courses/usr_student_1",
      createdAt: "2026-03-04T12:05:00.000Z",
    },
    {
      _id: "noti_3",
      userId: "usr_admin_1",
      title: "طلبات اشتراك جديدة بانتظار التفعيل",
      description: "يوجد طلبات اشتراك جديدة من الطلاب في قائمة الانتظار تحتاج إلى المراجعة والتأكيد.",
      type: "warning",
      seen: false,
      link: "/orders",
      createdAt: "2026-03-06T15:35:00.000Z",
    },
  ];

  return { users, courses, carts, notifications };
}

export let db: DatabaseSchema = {
  users: [],
  courses: [],
  carts: [],
  notifications: [],
};

export async function initDb(): Promise<void> {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        db = {
          users: parsed.users,
          courses: Array.isArray(parsed.courses) ? parsed.courses : [],
          carts: Array.isArray(parsed.carts) ? parsed.carts : [],
          notifications: Array.isArray(parsed.notifications)
            ? parsed.notifications
            : [],
        };
        return;
      }
    }
  } catch (err) {
    console.warn("Re-initializing database store:", err);
  }
  db = await createInitialSeedData();
  saveDb();
}

export function saveDb(): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save store:", err);
  }
}

export function sanitizeUser(user: StoredUser) {
  const { password, ...rest } = user;
  return rest;
}

export function populateCart(cart: StoredCart) {
  const user = db.users.find((u) => u._id === cart.userId);
  const populatedCourses = cart.courses
    .map((item) => {
      const course = db.courses.find((c) => c._id === item.courseId);
      if (!course) return null;
      return {
        _id: item._id,
        course,
        status: item.status,
        dateAdded: item.dateAdded,
        completedLectures: item.completedLectures || [],
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    _id: cart._id,
    user: user ? sanitizeUser(user) : null,
    courses: populatedCourses,
    createdAt: cart.createdAt,
  };
}

export function createNotification(params: {
  userId: string;
  title: string;
  description: string;
  type: "success" | "update" | "error" | "warning";
  link?: string;
}) {
  const noti: StoredNotification = {
    _id: generateId("noti"),
    userId: params.userId,
    title: params.title,
    description: params.description,
    type: params.type,
    seen: false,
    link: params.link || "",
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(noti);
  saveDb();
  return noti;
}
