import { Response } from 'express';
import { prisma } from '../config/db.js';
import { RoadmapService } from '../services/roadmap.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class RoadmapController {
  /**
   * Generate and persist a personalized learning roadmap
   */
  public static async generateRoadmap(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { targetRole, durationDays, focusSkills } = req.body;

      // Plan roadmap milestones
      const roadmapPlan = await RoadmapService.generateRoadmap(
        targetRole,
        durationDays || 60,
        focusSkills || []
      );

      // Persist in PostgreSQL
      const roadmap = await prisma.careerRoadmap.create({
        data: {
          userId,
          title: roadmapPlan.title,
          targetRole: roadmapPlan.targetRole,
          durationDays: roadmapPlan.durationDays,
          overview: roadmapPlan.overview,
          milestones: {
            create: roadmapPlan.milestones.map((m) => ({
              title: m.title,
              description: m.description,
              orderIndex: m.orderIndex,
              estimatedDays: m.estimatedDays,
              topics: m.topics as any,
              resources: m.resources as any,
              projects: m.projects as any,
            })),
          },
        },
        include: {
          milestones: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          type: 'ROADMAP_GENERATED',
          title: `Created Roadmap: ${roadmap.title}`,
          description: `Structured ${roadmap.milestones.length} milestones covering ${roadmap.durationDays} days.`,
          metadata: { roadmapId: roadmap.id },
        },
      });

      return sendSuccess(res, { roadmap }, 'Roadmap generated successfully', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to generate roadmap', 500, error.message);
    }
  }

  /**
   * Get all roadmaps for current user
   */
  public static async getRoadmaps(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const roadmaps = await prisma.careerRoadmap.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          milestones: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      return sendSuccess(res, { roadmaps }, 'Roadmaps retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve roadmaps', 500, error.message);
    }
  }

  /**
   * Get specific roadmap by ID
   */
  public static async getRoadmapById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const roadmap = await prisma.careerRoadmap.findFirst({
        where: { id, userId },
        include: {
          milestones: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!roadmap) {
        return sendError(res, 'Roadmap not found', 404);
      }

      return sendSuccess(res, { roadmap }, 'Roadmap retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve roadmap', 500, error.message);
    }
  }

  /**
   * Toggle milestone completion status
   */
  public static async updateMilestone(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);
      const { id, milestoneId } = req.params;
      const { isCompleted } = req.body;

      // Check roadmap ownership
      const roadmap = await prisma.careerRoadmap.findFirst({
        where: { id, userId },
      });
      if (!roadmap) {
        return sendError(res, 'Roadmap not found or unauthorized', 404);
      }

      const milestone = await prisma.roadmapMilestone.update({
        where: { id: milestoneId },
        data: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      if (isCompleted) {
        await prisma.activity.create({
          data: {
            userId,
            type: 'MILESTONE_COMPLETED',
            title: `Completed Milestone: ${milestone.title}`,
            description: `Advanced your ${roadmap.targetRole} career roadmap.`,
            metadata: { roadmapId: id, milestoneId },
          },
        });
      }

      // Check if all milestones are complete
      const allMilestones = await prisma.roadmapMilestone.findMany({
        where: { roadmapId: id },
      });
      const allDone = allMilestones.every(m => m.isCompleted);
      if (allDone) {
        await prisma.careerRoadmap.update({
          where: { id },
          data: { status: 'COMPLETED' },
        });
      }

      return sendSuccess(res, { milestone }, 'Milestone updated');
    } catch (error: any) {
      return sendError(res, 'Failed to update milestone', 500, error.message);
    }
  }
}
