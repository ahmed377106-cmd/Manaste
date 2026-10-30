import { Router } from 'express';
import { getNotifications, markNotificationsSeen, getDashboardStats } from '../controllers/statsController';
import { authMiddleware, staffMiddleware } from '../middleware/auth';

export const notificationRouter = Router();
notificationRouter.get('/', authMiddleware, getNotifications);
notificationRouter.post('/seen', authMiddleware, markNotificationsSeen);

export const statsRouter = Router();
statsRouter.get('/', authMiddleware, staffMiddleware, getDashboardStats);
