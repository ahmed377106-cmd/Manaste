import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
  suspendCourse,
  addLecture,
  deleteLecture,
} from '../controllers/courseController';
import { authMiddleware, staffMiddleware } from '../middleware/auth';

const courseRouter = Router();

courseRouter.get('/', getAllCourses);
courseRouter.get('/:id', getCourseById);
courseRouter.post('/', authMiddleware, staffMiddleware, addCourse);
courseRouter.put('/:id', authMiddleware, staffMiddleware, updateCourse);
courseRouter.delete('/:id', authMiddleware, staffMiddleware, deleteCourse);
courseRouter.patch('/:id/suspend', authMiddleware, staffMiddleware, suspendCourse);
courseRouter.patch('/:id/add-lecture', authMiddleware, staffMiddleware, addLecture);
courseRouter.delete('/:id/lectures/:index', authMiddleware, staffMiddleware, deleteLecture);

export default courseRouter;
