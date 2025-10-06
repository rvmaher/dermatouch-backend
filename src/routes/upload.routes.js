import express from 'express';
import { uploadProductImage, uploadCategoryImage } from '../controllers/upload.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/product', authMiddleware, adminMiddleware, uploadSingle('image'), uploadProductImage);
router.post('/category', authMiddleware, adminMiddleware, uploadSingle('image'), uploadCategoryImage);

export default router;