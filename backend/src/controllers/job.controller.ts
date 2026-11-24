import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AIService } from '../services/ai.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class JobController {
  /**
   * Create and parse a new Job Description
   */
  public static async createJob(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { title, company, experienceLevel, rawText } = req.body;

      // Extract skills and structured requirements
      const parsedData = await AIService.parseJobDescription(rawText);

      const job = await prisma.jobDescription.create({
        data: {
          userId,
          title,
          company: company || 'Company',
          experienceLevel: experienceLevel || 'Mid-Level',
          rawText,
          parsedData: parsedData as any,
        },
      });

      // Record activity
      await prisma.activity.create({
        data: {
          userId,
          type: 'JOB_ANALYZED',
          title: `Analyzed Job: ${title}`,
          description: `Extracted ${parsedData.requiredSkills.length} required skills and role criteria.`,
          metadata: { jobId: job.id },
        },
      });

      return sendSuccess(res, { job }, 'Job description analyzed and saved successfully', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to analyze job description', 500, error.message);
    }
  }

  /**
   * Get all analyzed jobs for user
   */
  public static async getJobs(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const jobs = await prisma.jobDescription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, { jobs }, 'Jobs retrieved successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch jobs', 500, error.message);
    }
  }

  /**
   * Get job by ID with ownership check
   */
  public static async getJobById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const job = await prisma.jobDescription.findFirst({
        where: { id, userId },
      });

      if (!job) {
        return sendError(res, 'Job description not found', 404);
      }

      return sendSuccess(res, { job }, 'Job details retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch job', 500, error.message);
    }
  }

  /**
   * Delete job with ownership check
   */
  public static async deleteJob(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const job = await prisma.jobDescription.findFirst({
        where: { id, userId },
      });

      if (!job) {
        return sendError(res, 'Job not found or unauthorized', 404);
      }

      await prisma.jobDescription.delete({
        where: { id },
      });

      return sendSuccess(res, null, 'Job description deleted successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to delete job', 500, error.message);
    }
  }
}
