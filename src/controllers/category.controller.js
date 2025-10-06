import prisma from '../prisma/client.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { uploadImage } from '../utils/cloudinary.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get categories error:', error);
    return sendError(res, 'Failed to retrieve categories', 500);
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            price: true,
            image: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    console.error('Get category error:', error);
    return sendError(res, 'Failed to retrieve category', 500);
  }
};

export const createCategory = async (req, res) => {
  try {
    let categoryData = { ...req.body };
    
    if (req.file) {
      const uploadResult = await uploadImage(req.file.buffer, 'dermatouch/categories');
      categoryData.image = uploadResult.secure_url;
    }

    const category = await prisma.category.create({
      data: categoryData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return sendError(res, 'Category with this name already exists', 409);
    }
    return sendError(res, 'Failed to create category', 500);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImage(req.file.buffer, 'dermatouch/categories');
      updateData.image = uploadResult.secure_url;
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'P2025') {
      return sendError(res, 'Category not found', 404);
    }
    if (error.code === 'P2002') {
      return sendError(res, 'Category with this name already exists', 409);
    }
    return sendError(res, 'Failed to update category', 500);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const productsCount = await prisma.product.count({
      where: { categoryId: parseInt(id) },
    });

    if (productsCount > 0) {
      return sendError(res, 'Cannot delete category with existing products', 400);
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    if (error.code === 'P2025') {
      return sendError(res, 'Category not found', 404);
    }
    return sendError(res, 'Failed to delete category', 500);
  }
};