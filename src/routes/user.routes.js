import express from 'express';
import { getAllUsers } from '../controllers/user.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/responseHandler.js';

const router = express.Router();

router.get('/test', authMiddleware, (req, res) => {
  return sendSuccess(res, { 
    message: 'Users API is working',
    user: req.user,
    isAdmin: req.user?.role === 'ADMIN'
  }, 'Test successful');
});

router.get('/', authMiddleware, adminMiddleware, getAllUsers);

export default router;