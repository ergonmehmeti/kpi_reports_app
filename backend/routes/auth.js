import express from 'express';
import { login, verifySession } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login - User login
router.post('/login', login);

// GET /api/auth/verify - Verify current session/token
router.get('/verify', verifyToken, verifySession);

export default router;
