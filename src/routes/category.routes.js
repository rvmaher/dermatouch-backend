import express from 'express';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { validateParams } from '../middleware/validation.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { z } from 'zod';

const router = express.Router();

const idParamSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});

// Public routes
router.get('/', getCategories);
router.get('/:id', validateParams(idParamSchema), getCategory);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, uploadSingle('image'), createCategory);
router.put('/:id', authMiddleware, adminMiddleware, validateParams(idParamSchema), uploadSingle('image'), updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, validateParams(idParamSchema), deleteCategory);

export default router;