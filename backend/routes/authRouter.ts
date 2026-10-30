import { Router } from 'express';
import {
  login,
  signup,
  getProfile,
  updateProfile,
  addAdmin,
  getAdminsAndManagers,
  updateRole,
  toggleBlockUser,
  deleteAccount,
} from '../controllers/userController';
import { authMiddleware, staffMiddleware } from '../middleware/auth';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/signup', signup);
authRouter.get('/profile', authMiddleware, getProfile);
authRouter.put('/profile', authMiddleware, updateProfile);
authRouter.post('/addadmin', authMiddleware, staffMiddleware, addAdmin);
authRouter.get('/getadmins', authMiddleware, staffMiddleware, getAdminsAndManagers);
authRouter.put('/updateRole', authMiddleware, staffMiddleware, updateRole);
authRouter.patch('/block/:userId', authMiddleware, staffMiddleware, toggleBlockUser);
authRouter.delete('/deleteAccount/:userId', authMiddleware, staffMiddleware, deleteAccount);

export default authRouter;
