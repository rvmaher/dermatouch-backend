import express from 'express';
import { createOrder, getOrders, getOrder, getAllOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema.js';
import { z } from 'zod';

const router = express.Router();

const idParamSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});

const orderQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'FULFILLED']).optional(),
});

// User routes
router.post('/', authMiddleware, validateBody(createOrderSchema), createOrder);
router.get('/', authMiddleware, validateQuery(orderQuerySchema), getOrders);
router.get('/:id', authMiddleware, validateParams(idParamSchema), getOrder);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, validateParams(idParamSchema), validateBody(updateOrderStatusSchema), updateOrderStatus);

export default router;