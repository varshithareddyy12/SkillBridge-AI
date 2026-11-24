import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';
import { sendError } from '../utils/response.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Invalid token format.', 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err: any) {
      return sendError(res, 'Session expired or invalid token. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, fullName: true },
    });

    if (!user) {
      return sendError(res, 'User associated with token no longer exists.', 401);
    }

    req.user = user;
    return next();
  } catch (error: any) {
    return sendError(res, 'Internal authentication error.', 500, error.message);
  }
}
