import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, targetRole, experienceLevel } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return sendError(res, 'An account with this email address already exists.', 409);
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          fullName,
          targetRole: targetRole || 'Full Stack Software Engineer',
          experienceLevel: experienceLevel || 'ENTRY',
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          targetRole: true,
          experienceLevel: true,
          role: true,
          createdAt: true,
        },
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return sendSuccess(res, { user, token }, 'Registration successful', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to register user', 500, error.message);
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return sendError(res, 'Invalid email or password.', 401);
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid email or password.', 401);
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const userResponse = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
      };

      return sendSuccess(res, { user: userResponse, token }, 'Logged in successfully');
    } catch (error: any) {
      return sendError(res, 'Login failed', 500, error.message);
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return sendError(res, 'Unauthorized', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          targetRole: true,
          experienceLevel: true,
          bio: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, { user }, 'User profile retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch user profile', 500, error.message);
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { fullName, targetRole, experienceLevel, bio } = req.body;

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(fullName ? { fullName } : {}),
          ...(targetRole ? { targetRole } : {}),
          ...(experienceLevel ? { experienceLevel } : {}),
          ...(bio !== undefined ? { bio } : {}),
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          targetRole: true,
          experienceLevel: true,
          bio: true,
          role: true,
          updatedAt: true,
        },
      });

      return sendSuccess(res, { user: updated }, 'Profile updated successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to update profile', 500, error.message);
    }
  }

  public static async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, currentPassword, newPassword } = req.body;
      const targetEmail = req.user?.email || email;

      const user = await prisma.user.findUnique({
        where: { email: targetEmail.toLowerCase() },
      });

      if (!user) {
        return sendError(res, 'Account not found', 404);
      }

      // If logged in and changing password, check current password
      if (currentPassword) {
        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) {
          return sendError(res, 'Incorrect current password', 400);
        }
      }

      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return sendSuccess(res, null, 'Password updated successfully. Please log in with your new password.');
    } catch (error: any) {
      return sendError(res, 'Failed to reset password', 500, error.message);
    }
  }

  public static async logout(_req: Request, res: Response) {
    return sendSuccess(res, null, 'Logged out successfully');
  }
}
