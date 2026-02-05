// server/src/routes/authRoutes.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { googleLogin } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/google
router.post('/google', verifyToken, googleLogin);

export default router;