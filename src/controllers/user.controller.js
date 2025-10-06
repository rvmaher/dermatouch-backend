import prisma from '../prisma/client.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getAllUsers = async (req, res) => {
  try {
    console.log('Getting all users for admin...');
    console.log('User making request:', req.user);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found users:', users.length);

    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get users error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    return sendError(res, `Failed to retrieve users: ${error.message}`, 500);
  }
};