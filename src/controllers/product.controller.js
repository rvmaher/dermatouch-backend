import prisma from '../prisma/client.js';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../utils/responseHandler.js';
import { uploadImage } from '../utils/cloudinary.js';

export const getProducts = async (req, res) => {
  try {
    const { page, limit, search, categoryId, sortBy, sortOrder } = req.validatedQuery || req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return sendPaginatedSuccess(res, products, pagination, 'Products retrieved successfully');
  } catch (error) {
    console.error('Get products error:', error);
    return sendError(res, 'Failed to retrieve products', 500);
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, product, 'Product retrieved successfully');
  } catch (error) {
    console.error('Get product error:', error);
    return sendError(res, 'Failed to retrieve product', 500);
  }
};

export const createProduct = async (req, res) => {
  try {
    let productData = { ...req.body };
    
    if (req.file) {
      const uploadResult = await uploadImage(req.file.buffer, 'dermatouch/products');
      productData.image = uploadResult.secure_url;
    }

    const category = await prisma.category.findUnique({
      where: { id: parseInt(productData.categoryId) },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    productData.categoryId = parseInt(productData.categoryId);
    productData.price = parseFloat(productData.price);
    productData.stock = parseInt(productData.stock);
    productData.isActive = productData.isActive === 'true';

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return sendError(res, 'Product with this SKU already exists', 409);
    }
    return sendError(res, 'Failed to create product', 500);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImage(req.file.buffer, 'dermatouch/products');
      updateData.image = uploadResult.secure_url;
    }

    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(updateData.categoryId) },
      });

      if (!category) {
        return sendError(res, 'Category not found', 404);
      }
      updateData.categoryId = parseInt(updateData.categoryId);
    }

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true';

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 'P2025') {
      return sendError(res, 'Product not found', 404);
    }
    if (error.code === 'P2002') {
      return sendError(res, 'Product with this SKU already exists', 409);
    }
    return sendError(res, 'Failed to update product', 500);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.code === 'P2025') {
      return sendError(res, 'Product not found', 404);
    }
    return sendError(res, 'Failed to delete product', 500);
  }
};