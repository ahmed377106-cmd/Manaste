import { Response } from "express";
import { db, saveDb } from "../db";
import { AuthRequest } from "../middleware/auth";

export function getNotifications(req: AuthRequest, res: Response): void {
  const list = db.notifications.filter((n) => n.userId === req.userId);
  res.status(200).json(list);
}

export function markNotificationsSeen(req: AuthRequest, res: Response): void {
  db.notifications.forEach((n) => {
    if (n.userId === req.userId) {
      n.seen = true;
    }
  });
  saveDb();
  const list = db.notifications.filter((n) => n.userId === req.userId);
  res.status(200).json(list);
}

export function getDashboardStats(_req: AuthRequest, res: Response): void {
  const totalStudents = db.users.filter((u) => u.role === "Student").length;
  const totalStaff = db.users.filter(
    (u) => u.role === "Admin" || u.role === "Manager"
  ).length;
  const totalCourses = db.courses.length;
  const activeCourses = db.courses.filter((c) => !c.suspend).length;
  const suspendedCourses = db.courses.filter((c) => c.suspend).length;
  const totalLectures = db.courses.reduce(
    (sum, c) => sum + (c.listOfLec?.length || 0),
    0
  );

  let waitingOrdersCount = 0;
  let acceptedEnrollmentsCount = 0;
  let rejectedEnrollmentsCount = 0;
  let estimatedRevenue = 0;

  db.carts.forEach((cart) => {
    cart.courses.forEach((item) => {
      if (item.status === "Waiting") waitingOrdersCount++;
      if (item.status === "Rejected") rejectedEnrollmentsCount++;
      if (item.status === "Accepted") {
        acceptedEnrollmentsCount++;
        const course = db.courses.find((c) => c._id === item.courseId);
        if (course) {
          estimatedRevenue += course.price || 200;
        }
      }
    });
  });

  const blockedStudents = db.users.filter(
    (u) => u.role === "Student" && u.blocked
  ).length;

  res.status(200).json({
    totalStudents,
    blockedStudents,
    totalStaff,
    totalCourses,
    activeCourses,
    suspendedCourses,
    totalLectures,
    waitingOrders: waitingOrdersCount,
    acceptedEnrollments: acceptedEnrollmentsCount,
    rejectedEnrollments: rejectedEnrollmentsCount,
    waitingOrdersCount,
    acceptedEnrollmentsCount,
    rejectedEnrollmentsCount,
    estimatedRevenue,
  });
}
