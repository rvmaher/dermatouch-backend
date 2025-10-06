import prisma from '../prisma/client.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getDashboardStats = async (req, res) => {
  try {
    console.log('Getting dashboard stats...');

    const [
      totalProducts,
      totalOrders,
      totalCategories,
      totalUsers,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const stats = {
      totalProducts,
      totalOrders,
      totalCategories,
      totalUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
    };

    console.log('Dashboard stats:', stats);

    return sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return sendError(res, 'Failed to retrieve dashboard stats', 500);
  }
};