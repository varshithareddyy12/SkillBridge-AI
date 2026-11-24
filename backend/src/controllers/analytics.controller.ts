import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class AnalyticsController {
  public static async getOverview(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const overview = await AnalyticsService.getUserOverview(userId);
      return sendSuccess(res, overview, 'Dashboard analytics retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch dashboard overview', 500, error.message);
    }
  }

  public static async getProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const progress = await AnalyticsService.getUserProgressAnalytics(userId);
      return sendSuccess(res, progress, 'Career progress analytics retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch career progress', 500, error.message);
    }
  }
}
