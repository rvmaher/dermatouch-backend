import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { validateQuery, validateParams } from '../middleware/validation.middleware.js';
import { productQuerySchema } from '../schemas/product.schema.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { z } from 'zod';

const router = express.Router();

const idParamSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});

// Public routes
router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/:id', validateParams(idParamSchema), getProduct);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, uploadSingle('image'), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, validateParams(idParamSchema), uploadSingle('image'), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, validateParams(idParamSchema), deleteProduct);

export default router;