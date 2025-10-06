import { sendError } from '../utils/responseHandler.js';

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      const errorMessage = error.errors?.map(err => `${err.path.join('.')}: ${err.message}`).join(', ') || 'Validation failed';
      return sendError(res, errorMessage, 400);
    }
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      const errorMessage = error.errors?.map(err => `${err.path.join('.')}: ${err.message}`).join(', ') || 'Validation failed';
      return sendError(res, errorMessage, 400);
    }
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      const errorMessage = error.errors?.map(err => `${err.path.join('.')}: ${err.message}`).join(', ') || 'Validation failed';
      return sendError(res, errorMessage, 400);
    }
  };
};