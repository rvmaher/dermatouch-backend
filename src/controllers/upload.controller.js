import { uploadImage } from '../utils/cloudinary.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    const result = await uploadImage(req.file.buffer, 'dermatouch/products');
    
    return sendSuccess(res, {
      url: result.secure_url,
      publicId: result.public_id,
    }, 'Product image uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    return sendError(res, 'Failed to upload image', 500);
  }
};

export const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    const result = await uploadImage(req.file.buffer, 'dermatouch/categories');
    
    return sendSuccess(res, {
      url: result.secure_url,
      publicId: result.public_id,
    }, 'Category image uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    return sendError(res, 'Failed to upload image', 500);
  }
};