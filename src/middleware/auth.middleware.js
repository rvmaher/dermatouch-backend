import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/responseHandler.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return sendError(res, "Admin access required", 403);
  }
  next();
};
