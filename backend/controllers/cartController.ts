import { Response } from "express";
import {
  db,
  saveDb,
  generateId,
  populateCart,
  sanitizeUser,
  createNotification,
} from "../db";
import { AuthRequest } from "../middleware/auth";
import { translateStatus, EnrollmentStatus } from "../../src/utils/platformLogic";

export function getCart(req: AuthRequest, res: Response): void {
  let cart = db.carts.find((c) => c.userId === req.userId);
  if (!cart) {
    cart = {
      _id: generateId("cart"),
      userId: req.userId!,
      courses: [],
      createdAt: new Date().toISOString(),
    };
    db.carts.push(cart);
    saveDb();
  }
  res.status(200).json(populateCart(cart));
}

export function addToCart(req: AuthRequest, res: Response): void {
  const { courseId, userId } = req.body;
  const targetUserId = userId || req.userId;
  if (!targetUserId || !courseId) {
    res.status(400).json({ message: "جميع الحقول مطلوبة" });
    return;
  }

  const user = db.users.find((u) => u._id === targetUserId);
  if (!user) {
    res.status(404).json({ message: "هذا الطالب غير متاح" });
    return;
  }

  const course = db.courses.find((c) => c._id === courseId);
  if (!course) {
    res.status(404).json({ message: "هذا الكورس غير متاح" });
    return;
  }

  let cart = db.carts.find((c) => c.userId === targetUserId);
  if (!cart) {
    cart = {
      _id: generateId("cart"),
      userId: targetUserId,
      courses: [],
      createdAt: new Date().toISOString(),
    };
    db.carts.push(cart);
  }

  const existing = cart.courses.find((item) => item.courseId === courseId);
  if (existing) {
    res.status(409).json({ message: "هذا الكورس مضاف بالفعل في قائمة دوراتك" });
    return;
  }

  cart.courses.push({
    _id: generateId("cc"),
    courseId,
    status: "Waiting",
    dateAdded: new Date().toISOString(),
    completedLectures: [],
  });

  createNotification({
    userId: targetUserId,
    title: "تم استلام طلب الاشتراك",
    description: `تم تسجيل طلب اشتراكك في "${course.subject}" وهو الآن قيد المراجعة والتفعيل.`,
    type: "update",
    link: `/courses/${targetUserId}`,
  });

  // Notify admins
  db.users
    .filter((u) => u.role === "Admin" || u.role === "Manager")
    .forEach((staff) => {
      createNotification({
        userId: staff._id,
        title: "طلب اشتراك جديد",
        description: `قام الطالب ${user.name} بطلب الاشتراك في كورس "${course.subject}".`,
        type: "warning",
        link: "/orders",
      });
    });

  saveDb();
  res.status(200).json(populateCart(cart));
}

export function removeFromCart(req: AuthRequest, res: Response): void {
  const { courseId } = req.params;
  const cart = db.carts.find((c) => c.userId === req.userId);
  if (!cart) {
    res.status(404).json({ message: "لا توجد دورات مسجلة" });
    return;
  }
  cart.courses = cart.courses.filter((item) => item.courseId !== courseId);
  saveDb();
  res.status(200).json(populateCart(cart));
}

export function acceptCart(req: AuthRequest, res: Response): void {
  const { courseId, cartId, userId } = req.body;
  const cart = db.carts.find((c) => c._id === cartId);
  if (!cart) {
    res.status(404).json({ message: "لا توجد عربة" });
    return;
  }
  if (userId && cart.userId !== userId) {
    res.status(403).json({ message: "لا يمكنك تعديل هذه العربة" });
    return;
  }
  const courseItem = cart.courses.find((item) => item.courseId === courseId);
  if (!courseItem) {
    res.status(404).json({ message: "هذا الكورس غير موجود في العربة" });
    return;
  }

  courseItem.status = "Accepted";
  const course = db.courses.find((c) => c._id === courseId);

  createNotification({
    userId: cart.userId,
    title: "تم قبول وتفعيل اشتراكك!",
    description: `تم تفعيل اشتراكك في كورس "${course?.subject || ""}". يمكنك مشاهدة المحاضرات الآن.`,
    type: "success",
    link: `/watch/${courseId}`,
  });

  saveDb();
  res.status(200).json(populateCart(cart));
}

export function rejectCart(req: AuthRequest, res: Response): void {
  const { courseId, cartId, userId } = req.body;
  const cart = db.carts.find((c) => c._id === cartId);
  if (!cart) {
    res.status(404).json({ message: "لا توجد عربة" });
    return;
  }
  if (userId && cart.userId !== userId) {
    res.status(403).json({ message: "لا يمكنك تعديل هذه العربة" });
    return;
  }
  const courseItem = cart.courses.find((item) => item.courseId === courseId);
  if (!courseItem) {
    res.status(404).json({ message: "هذا الكورس غير موجود في العربة" });
    return;
  }

  courseItem.status = "Rejected";
  const course = db.courses.find((c) => c._id === courseId);

  createNotification({
    userId: cart.userId,
    title: "تحديث بخصوص طلب الاشتراك",
    description: `تعذر تفعيل اشتراكك في كورس "${course?.subject || ""}". يرجى مراجعة إيصال الدفع مع الدعم الفني.`,
    type: "error",
    link: `/courses/${cart.userId}`,
  });

  saveDb();
  res.status(200).json(populateCart(cart));
}

export function getWaitingCourses(_req: AuthRequest, res: Response): void {
  const waitingCourses = db.carts.flatMap((cart) => {
    const user = db.users.find((u) => u._id === cart.userId);
    if (!user) return [];
    return cart.courses
      .filter((item) => item.status === "Waiting")
      .map((item) => {
        const course = db.courses.find((c) => c._id === item.courseId);
        if (!course) return null;
        return {
          user: sanitizeUser(user),
          course,
          cartId: cart._id,
          status: item.status,
          dateAdded: item.dateAdded,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  });

  res.status(200).json(waitingCourses);
}

export function getAllCarts(_req: AuthRequest, res: Response): void {
  const students = db.users.filter((u) => u.role === "Student");
  const result = students.map((student) => {
    let cart = db.carts.find((c) => c.userId === student._id);
    if (!cart) {
      cart = {
        _id: generateId("cart"),
        userId: student._id,
        courses: [],
        createdAt: student.createdAt,
      };
      db.carts.push(cart);
    }
    return populateCart(cart);
  });

  res.status(200).json(result);
}

export function updateCartStatus(req: AuthRequest, res: Response): void {
  const { courseId, cartId, status } = req.body as {
    courseId: string;
    cartId: string;
    status: EnrollmentStatus;
  };
  const cart = db.carts.find((c) => c._id === cartId);
  if (!cart) {
    res.status(404).json({ message: "لا توجد عربة" });
    return;
  }
  const courseItem = cart.courses.find((item) => item.courseId === courseId);
  if (!courseItem) {
    res.status(404).json({ message: "هذا الكورس غير موجود في العربة" });
    return;
  }

  courseItem.status = status;
  const course = db.courses.find((c) => c._id === courseId);

  createNotification({
    userId: cart.userId,
    title: "تم تحديث حالة اشتراكك",
    description: `تم تغيير حالة اشتراكك في "${course?.subject || ""}" إلى: ${translateStatus(status)}.`,
    type: status === "Accepted" ? "success" : status === "Rejected" ? "error" : "update",
    link: status === "Accepted" ? `/watch/${courseId}` : `/courses/${cart.userId}`,
  });

  saveDb();
  res.status(200).json(populateCart(cart));
}

export function toggleLectureProgress(req: AuthRequest, res: Response): void {
  const { courseId, lectureIndex } = req.body;
  const cart = db.carts.find((c) => c.userId === req.userId);
  if (!cart) {
    res.status(404).json({ message: "لا توجد دورات مسجلة" });
    return;
  }
  const courseItem = cart.courses.find((item) => item.courseId === courseId);
  if (!courseItem) {
    res.status(404).json({ message: "أنت غير مشترك في هذا الكورس" });
    return;
  }

  if (!Array.isArray(courseItem.completedLectures)) {
    courseItem.completedLectures = [];
  }

  const idx = Number(lectureIndex);
  if (courseItem.completedLectures.includes(idx)) {
    courseItem.completedLectures = courseItem.completedLectures.filter(
      (i) => i !== idx
    );
  } else {
    courseItem.completedLectures.push(idx);
  }

  saveDb();
  res.status(200).json({
    completedLectures: courseItem.completedLectures,
    cart: populateCart(cart),
  });
}
