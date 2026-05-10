import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  googleAuth,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);

export default router;
