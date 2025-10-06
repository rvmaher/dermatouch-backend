import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats);

export default router;