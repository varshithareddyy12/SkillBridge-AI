import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(`Error in [${req.method}] ${req.originalUrl}:`, err.message || err);

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'Unauthorized access', 401);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'A record with these unique details already exists.', 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Resource not found.', 404);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Server error';

  return sendError(res, message, statusCode);
}
