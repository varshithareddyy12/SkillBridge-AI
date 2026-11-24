import { Response } from 'express';
import { prisma } from '../config/db.js';
import { ProjectService } from '../services/project.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class ProjectController {
  /**
   * Recommend practical projects to bridge skill gaps and optionally persist them
   */
  public static async recommendProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { targetRole, missingSkills, difficulty } = req.body;

      // Generate recommendation items
      const projects = await ProjectService.recommendProjects(
        targetRole,
        missingSkills || [],
        difficulty || 'INTERMEDIATE'
      );

      // Automatically persist recommendations for the user
      const createdProjects = await Promise.all(
        projects.map((p) =>
          prisma.projectRecommendation.create({
            data: {
              userId,
              title: p.title,
              problemStatement: p.problemStatement,
              technologies: p.technologies as any,
              skillsDeveloped: p.skillsDeveloped as any,
              difficulty: p.difficulty,
              implementationSteps: p.implementationSteps as any,
              expectedOutcome: p.expectedOutcome,
              portfolioValue: p.portfolioValue,
              status: 'SAVED',
            },
          })
        )
      );

      await prisma.activity.create({
        data: {
          userId,
          type: 'PROJECT_SAVED',
          title: `Project Recommendations Generated`,
          description: `Discovered ${createdProjects.length} targeted projects for ${targetRole}.`,
        },
      });

      return sendSuccess(res, { projects: createdProjects }, 'Projects recommended and saved', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to recommend projects', 500, error.message);
    }
  }

  /**
   * Get all projects for current user
   */
  public static async getProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const projects = await prisma.projectRecommendation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, { projects }, 'Projects retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve projects', 500, error.message);
    }
  }

  /**
   * Update project status (SAVED, IN_PROGRESS, COMPLETED)
   */
  public static async updateProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);
      const { id } = req.params;
      const { status } = req.body;

      const project = await prisma.projectRecommendation.findFirst({
        where: { id, userId },
      });

      if (!project) {
        return sendError(res, 'Project not found or unauthorized', 404);
      }

      const updated = await prisma.projectRecommendation.update({
        where: { id },
        data: { status },
      });

      if (status === 'COMPLETED') {
        await prisma.activity.create({
          data: {
            userId,
            type: 'PROJECT_COMPLETED',
            title: `Completed Project: ${project.title}`,
            description: `Validated practical skills in ${(project.technologies as string[] || []).join(', ')}.`,
            metadata: { projectId: id },
          },
        });

        // Also upgrade user skills verification status to PROJECT_VERIFIED!
        const techs = (project.technologies as string[]) || [];
        for (const tech of techs) {
          const userSkill = await prisma.userSkill.findFirst({
            where: {
              userId,
              skill: { name: { equals: tech, mode: 'insensitive' } },
            },
          });
          if (userSkill) {
            await prisma.userSkill.update({
              where: { id: userSkill.id },
              data: { verificationSource: 'PROJECT_VERIFIED' },
            });
          }
        }
      }

      return sendSuccess(res, { project: updated }, 'Project status updated');
    } catch (error: any) {
      return sendError(res, 'Failed to update project status', 500, error.message);
    }
  }
}
