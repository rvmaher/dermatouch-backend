import prisma from '../prisma/client.js';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../utils/responseHandler.js';

export const createOrder = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user.id;

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId, isActive: true },
      });

      if (!product) {
        return sendError(res, `Product with ID ${item.productId} not found`, 404);
      }

      if (product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for product ${product.title}`, 400);
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          address,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    return sendError(res, 'Failed to create order', 500);
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return sendPaginatedSuccess(res, orders, pagination, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Get orders error:', error);
    return sendError(res, 'Failed to retrieve orders', 500);
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order error:', error);
    return sendError(res, 'Failed to retrieve order', 500);
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log('Getting all orders for admin...');
    
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
      },
    });

    console.log('Found orders:', orders.length);

    return sendSuccess(res, orders, 'All orders retrieved successfully');
  } catch (error) {
    console.error('Get all orders error:', error);
    console.error('Error details:', error.message);
    return sendError(res, 'Failed to retrieve orders', 500);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentRef } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(paymentRef && { paymentRef }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, order, 'Order status updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.code === 'P2025') {
      return sendError(res, 'Order not found', 404);
    }
    return sendError(res, 'Failed to update order status', 500);
  }
};