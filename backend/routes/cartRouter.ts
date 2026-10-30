import { Router } from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  acceptCart,
  rejectCart,
  getWaitingCourses,
  getAllCarts,
  updateCartStatus,
  toggleLectureProgress,
} from '../controllers/cartController';
import { authMiddleware, staffMiddleware } from '../middleware/auth';

const cartRouter = Router();

cartRouter.get('/waiting', authMiddleware, staffMiddleware, getWaitingCourses);
cartRouter.get('/all', authMiddleware, staffMiddleware, getAllCarts);
cartRouter.patch('/accept', authMiddleware, staffMiddleware, acceptCart);
cartRouter.patch('/reject', authMiddleware, staffMiddleware, rejectCart);
cartRouter.patch('/update-status', authMiddleware, staffMiddleware, updateCartStatus);

cartRouter.get('/', authMiddleware, getCart);
cartRouter.post('/', authMiddleware, addToCart);
cartRouter.patch('/progress', authMiddleware, toggleLectureProgress);
cartRouter.delete('/:courseId', authMiddleware, removeFromCart);

export default cartRouter;
