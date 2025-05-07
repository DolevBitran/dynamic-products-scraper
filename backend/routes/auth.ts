import express, { Router } from 'express';
import { register, login, refreshToken, getCurrentUser } from '../controllers/authController';
import authenticateUser from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', authenticateUser, getCurrentUser);

export default router;
