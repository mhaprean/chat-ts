import {
  register,
  login,
  profile,
  refreshToken,
  confirmAccount,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import express from 'express';
import { isAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/confirm', confirmAccount);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// add auth middleware to profile page. visible only when the user is logged in
router.get('/profile', isAuth, profile);

// refresh the acces token when expired
router.post('/refresh', refreshToken);

export default router;
