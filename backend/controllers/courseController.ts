import { Request, Response } from "express";
import { db, saveDb, generateId, StoredCourse } from "../db";
import { validateCourseInput } from "../../src/utils/platformLogic";

export function getAllCourses(_req: Request, res: Response): void {
  res.status(200).json(db.courses);
}

export function getCourseById(req: Request, res: Response): void {
  const course = db.courses.find((c) => c._id === req.params.id);
  if (!course) {
    res.status(404).json({ msg: "هذا الكورس غير متاح" });
    return;
  }
  res.status(200).json(course);
}

export function addCourse(req: Request, res: Response): void {
  const {
    subject,
    year,
    term,
    teacher,
    teacherImg,
    listOfLec,
    description,
    branch,
    suspend,
    price,
  } = req.body;

  const validation = validateCourseInput({
    subject,
    year,
    term,
    teacher,
    description,
    branch,
  });
  if (!validation.valid) {
    res.status(400).json({ msg: validation.error });
    return;
  }

  const newCourse: StoredCourse = {
    _id: generateId("crs"),
    subject: String(subject).trim(),
    year,
    term,
    teacher: String(teacher).trim(),
    teacherImg:
      teacherImg && String(teacherImg).trim()
        ? String(teacherImg).trim()
        : `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
            subject
          )}&backgroundColor=b6e3f4`,
    listOfLec: Array.isArray(listOfLec) ? listOfLec : [],
    suspend: Boolean(suspend),
    description: String(description).trim(),
    branch,
    price: Number(price) || 200,
    createdAt: new Date().toISOString(),
  };

  db.courses.unshift(newCourse);
  saveDb();
  res.status(201).json(newCourse);
}

export function updateCourse(req: Request, res: Response): void {
  const course = db.courses.find((c) => c._id === req.params.id);
  if (!course) {
    res.status(404).json({ msg: "هذا الكورس غير متوفر" });
    return;
  }

  const {
    subject,
    year,
    term,
    teacher,
    teacherImg,
    listOfLec,
    description,
    branch,
    suspend,
    price,
  } = req.body;

  const validation = validateCourseInput({
    subject: subject ?? course.subject,
    year: year ?? course.year,
    term: term ?? course.term,
    teacher: teacher ?? course.teacher,
    description: description ?? course.description,
    branch: branch ?? course.branch,
  });
  if (!validation.valid) {
    res.status(400).json({ msg: validation.error });
    return;
  }

  if (subject !== undefined) course.subject = String(subject).trim();
  if (year !== undefined) course.year = year;
  if (term !== undefined) course.term = term;
  if (teacher !== undefined) course.teacher = String(teacher).trim();
  if (teacherImg !== undefined) course.teacherImg = String(teacherImg).trim();
  if (Array.isArray(listOfLec)) course.listOfLec = listOfLec;
  if (description !== undefined)
    course.description = String(description).trim();
  if (branch !== undefined) course.branch = branch;
  if (suspend !== undefined) course.suspend = Boolean(suspend);
  if (price !== undefined) course.price = Number(price) || course.price;

  saveDb();
  res.status(200).json(course);
}

export function deleteCourse(req: Request, res: Response): void {
  const idx = db.courses.findIndex((c) => c._id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ msg: "هذا الكورس غير متاح" });
    return;
  }
  const removedId = db.courses[idx]._id;
  db.courses.splice(idx, 1);
  db.carts.forEach((cart) => {
    cart.courses = cart.courses.filter((item) => item.courseId !== removedId);
  });
  saveDb();
  res.status(200).json({ msg: "تم حذف الكورس بنجاح" });
}

export function suspendCourse(req: Request, res: Response): void {
  const course = db.courses.find((c) => c._id === req.params.id);
  if (!course) {
    res.status(404).json({ msg: "هذا الكورس غير متاح" });
    return;
  }
  course.suspend = !course.suspend;
  saveDb();
  res.status(200).json({
    msg: `تم ${course.suspend ? "إيقاف" : "تفعيل"} الكورس بنجاح`,
    course,
  });
}

export function addLecture(req: Request, res: Response): void {
  const { id } = req.params;
  const { lectureLink } = req.body;
  if (!lectureLink || !String(lectureLink).trim()) {
    res.status(400).json({ msg: "يجب إدخال رابط المحاضرة" });
    return;
  }
  const course = db.courses.find((c) => c._id === id);
  if (!course) {
    res.status(404).json({ msg: "هذا الكورس غير متاح" });
    return;
  }
  course.listOfLec.push(String(lectureLink).trim());
  saveDb();
  res.status(200).json({ msg: "تم إضافة المحاضرة بنجاح", course });
}

export function deleteLecture(req: Request, res: Response): void {
  const { id, index } = req.params;
  const course = db.courses.find((c) => c._id === id);
  if (!course) {
    res.status(404).json({ msg: "هذا الكورس غير متاح" });
    return;
  }
  const idx = Number(index);
  if (isNaN(idx) || idx < 0 || idx >= course.listOfLec.length) {
    res.status(400).json({ msg: "رقم المحاضرة غير صحيح" });
    return;
  }
  course.listOfLec.splice(idx, 1);
  saveDb();
  res.status(200).json({ msg: "تم حذف المحاضرة بنجاح", course });
}
