import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  db,
  saveDb,
  sanitizeUser,
  generateId,
  createNotification,
  StoredUser,
} from "../db";
import { AuthRequest, JWT_SECRET } from "../middleware/auth";
import { validateStudentSignup } from "../../src/utils/platformLogic";

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ msg: "جميع الحقول مطلوبة" });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    res
      .status(400)
      .json({ msg: "برجاء التأكد من البريد الإلكتروني وكلمة المرور" });
    return;
  }

  if (user.blocked) {
    res
      .status(403)
      .json({ msg: "هذا الحساب موقوف حالياً، يرجى التواصل مع إدارة المنصة" });
    return;
  }

  const isMatch = await bcrypt.compare(String(password), user.password);
  if (!isMatch) {
    res
      .status(400)
      .json({ msg: "برجاء التأكد من البريد الإلكتروني وكلمة المرور" });
    return;
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "24h",
  });
  res.json({ token, user: sanitizeUser(user) });
}

export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password, branch, year, phone, fatherPhone, role } =
    req.body;
  const validation = validateStudentSignup({
    name,
    email,
    password,
    branch,
    year,
    phone,
    fatherPhone,
  });

  if (!validation.valid) {
    res.status(400).json({ msg: validation.error });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.users.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (existing) {
    res.status(400).json({ msg: "هذا البريد الإلكتروني مسجل بالفعل" });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(String(password), salt);

  const newUser: StoredUser = {
    _id: generateId("usr"),
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role === "Admin" || role === "Manager" ? role : "Student",
    blocked: false,
    year,
    branch,
    phone: String(phone).trim(),
    fatherPhone: String(fatherPhone).trim(),
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.carts.push({
    _id: generateId("cart"),
    userId: newUser._id,
    courses: [],
    createdAt: new Date().toISOString(),
  });

  createNotification({
    userId: newUser._id,
    title: "مرحباً بك في منصتي التعليمية!",
    description:
      "تم إنشاء حسابك بنجاح. يمكنك الآن تصفح المقررات الدراسية والاشتراك في دورات صفك الدراسي.",
    type: "success",
    link: "/courses",
  });

  saveDb();

  const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
    expiresIn: "24h",
  });
  res.status(201).json({ token, user: sanitizeUser(newUser) });
}

export function getProfile(req: AuthRequest, res: Response): void {
  const user = db.users.find((u) => u._id === req.userId);
  if (!user) {
    res.status(404).json({ msg: "الحساب غير موجود" });
    return;
  }
  res.json(sanitizeUser(user));
}

export async function updateProfile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const user = db.users.find((u) => u._id === req.userId);
  if (!user) {
    res.status(404).json({ msg: "الحساب غير موجود" });
    return;
  }

  const { name, email, password, branch, year, phone, fatherPhone } = req.body;
  if (name) {
    if (String(name).trim().length < 6) {
      res.status(400).json({ msg: "يجب ألا يقل الاسم عن 6 حروف" });
      return;
    }
    user.name = String(name).trim();
  }
  if (email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const conflict = db.users.find(
      (u) => u._id !== user._id && u.email.toLowerCase() === normalizedEmail
    );
    if (conflict) {
      res.status(400).json({ msg: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }
    user.email = normalizedEmail;
  }
  if (branch) user.branch = branch;
  if (year) user.year = year;
  if (phone) {
    if (!/^01\d{9}$/.test(String(phone).trim())) {
      res
        .status(400)
        .json({ msg: "رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 01" });
      return;
    }
    user.phone = String(phone).trim();
  }
  if (fatherPhone) {
    if (!/^01\d{9}$/.test(String(fatherPhone).trim())) {
      res
        .status(400)
        .json({ msg: "رقم هاتف ولي الأمر يجب أن يتكون من 11 رقماً ويبدأ بـ 01" });
      return;
    }
    user.fatherPhone = String(fatherPhone).trim();
  }
  if (password && String(password).trim().length > 0) {
    if (String(password).length < 8) {
      res.status(400).json({ msg: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(password), salt);
  }

  saveDb();
  res.json({ msg: "تم تحديث البيانات الشخصية بنجاح", user: sanitizeUser(user) });
}

export async function addAdmin(req: Request, res: Response): Promise<void> {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !phone) {
    res.status(400).json({ msg: "جميع الحقول مطلوبة" });
    return;
  }
  if (String(name).trim().length < 6) {
    res.status(400).json({ msg: "يجب ألا يقل الاسم عن 6 حروف" });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    res.status(400).json({ msg: "يرجى إدخال بريد إلكتروني صحيح" });
    return;
  }
  const passwordComplexityRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.~`])[A-Za-z\d@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.~`]{8,}$/;
  if (!passwordComplexityRegex.test(String(password))) {
    res.status(400).json({
      msg: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وتحتوي على حرف كبير، حرف صغير، رقم، ورمز خاص",
    });
    return;
  }
  const phoneRegex = /^01\d{9}$/;
  if (!phoneRegex.test(String(phone).trim())) {
    res.status(400).json({
      msg: "برجاء إدخال رقم هاتف صحيح مكون من 11 رقماً يبدأ بـ 01",
    });
    return;
  }

  const targetRole = role === "Admin" ? "Admin" : "Manager";
  const normalizedEmail = String(email).trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    res.status(400).json({ msg: "هذا الحساب موجود بالفعل" });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(String(password), salt);

  const newAdmin: StoredUser = {
    _id: generateId("usr"),
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: String(phone).trim(),
    role: targetRole,
    blocked: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newAdmin);
  saveDb();
  res.status(201).json({ user: sanitizeUser(newAdmin) });
}

export function getAdminsAndManagers(_req: Request, res: Response): void {
  const admins = db.users
    .filter((u) => u.role === "Admin" || u.role === "Manager")
    .map(sanitizeUser);
  res.status(200).json(admins);
}

export function updateRole(req: Request, res: Response): void {
  const { userId, role } = req.body;
  if (role !== "Admin" && role !== "Manager") {
    res.status(400).json({ msg: "الدور يجب أن يكون مدير أو مشرف إداري" });
    return;
  }
  const user = db.users.find((u) => u._id === userId);
  if (!user) {
    res.status(404).json({ msg: "الحساب غير موجود" });
    return;
  }
  user.role = role;
  saveDb();
  res
    .status(200)
    .json({ msg: "تم تحديث الصلاحية بنجاح", user: sanitizeUser(user) });
}

export function toggleBlockUser(req: Request, res: Response): void {
  const { userId } = req.params;
  const user = db.users.find((u) => u._id === userId);
  if (!user) {
    res.status(404).json({ msg: "الحساب غير موجود" });
    return;
  }
  user.blocked = !user.blocked;
  saveDb();
  res.status(200).json({
    msg: user.blocked ? "تم إيقاف الحساب" : "تم تفعيل الحساب",
    user: sanitizeUser(user),
  });
}

export function deleteAccount(req: Request, res: Response): void {
  const { userId } = req.params;
  const index = db.users.findIndex((u) => u._id === userId);
  if (index === -1) {
    res.status(404).json({ msg: "الحساب غير موجود" });
    return;
  }
  db.users.splice(index, 1);
  db.carts = db.carts.filter((c) => c.userId !== userId);
  db.notifications = db.notifications.filter((n) => n.userId !== userId);
  saveDb();
  res.status(200).json({ msg: "تم حذف الحساب بنجاح" });
}
