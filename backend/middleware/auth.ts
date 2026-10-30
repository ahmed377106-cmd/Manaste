import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";

export const JWT_SECRET =
  process.env.JWT_SECRET || "educational-platform-secret-key-2026";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    res.status(401).json({ msg: "يرجى تسجيل الدخول أولاً" });
    return;
  }

  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];
  if (!token) {
    res.status(401).json({ msg: "صيغة رمز الدخول غير صحيحة" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.users.find((u) => u._id === decoded.userId);
    if (!user) {
      res.status(401).json({ msg: "الحساب غير موجود" });
      return;
    }
    if (user.blocked) {
      res
        .status(403)
        .json({ msg: "تم إيقاف هذا الحساب مؤقتاً، يرجى التواصل مع الإدارة" });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch {
    res
      .status(401)
      .json({ msg: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً" });
  }
}

export function staffMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const user = db.users.find((u) => u._id === req.userId);
  if (!user || (user.role !== "Admin" && user.role !== "Manager")) {
    res.status(403).json({ msg: "غير مصرح لك بالوصول إلى هذه الصلاحية" });
    return;
  }
  next();
}
