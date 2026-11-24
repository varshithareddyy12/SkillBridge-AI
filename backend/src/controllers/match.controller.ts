import { Response } from 'express';
import { prisma } from '../config/db.js';
import { MatchingEngineService } from '../services/matching-engine.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ParsedResumeData, ParsedJobData } from '../types/index.js';

export class MatchController {
  /**
   * Run deterministic matching calculation between a resume and a job description
   */
  public static async runMatch(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { resumeId, jobDescriptionId } = req.body;

      // 1. Fetch resume and verify ownership
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (!resume) {
        return sendError(res, 'Resume not found or unauthorized access', 404);
      }

      // 2. Fetch job and verify ownership
      const job = await prisma.jobDescription.findFirst({
        where: { id: jobDescriptionId, userId },
      });
      if (!job) {
        return sendError(res, 'Job description not found or unauthorized access', 404);
      }

      // 3. Fetch user's verified skills
      const userSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });

      const skillList = userSkills.map(us => ({
        name: us.skill.name,
        proficiencyLevel: us.proficiencyLevel,
        verificationSource: us.verificationSource,
      }));

      // 4. Calculate deterministic match
      const matchResult = MatchingEngineService.calculateMatch(
        resume.parsedData as unknown as ParsedResumeData,
        job.parsedData as unknown as ParsedJobData,
        skillList
      );

      // 5. Persist MatchReport in PostgreSQL
      const matchReport = await prisma.matchReport.create({
        data: {
          userId,
          resumeId,
          jobDescriptionId,
          overallMatchScore: matchResult.overallMatchScore,
          skillMatchScore: matchResult.skillMatchScore,
          experienceMatchScore: matchResult.experienceMatchScore,
          educationMatchScore: matchResult.educationMatchScore,
          matchedSkills: matchResult.matchedSkills as any,
          partialSkills: matchResult.partialSkills as any,
          missingSkills: matchResult.missingSkills as any,
          breakdown: matchResult.breakdown as any,
          recommendations: matchResult.recommendations as any,
        },
        include: {
          resume: { select: { title: true, fileName: true } },
          jobDescription: { select: { title: true, company: true } },
        },
      });

      // 6. Record activity
      await prisma.activity.create({
        data: {
          userId,
          type: 'MATCH_RUN',
          title: `Match Analysis: ${job.title}`,
          description: `Calculated match score of ${matchResult.overallMatchScore}% against ${job.company || 'Job'}.`,
          metadata: { matchReportId: matchReport.id, score: matchResult.overallMatchScore },
        },
      });

      return sendSuccess(res, { matchReport }, 'Match analysis completed successfully', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to calculate match score', 500, error.message);
    }
  }

  /**
   * Get all previous match reports
   */
  public static async getMatches(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const matches = await prisma.matchReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          resume: { select: { id: true, title: true, fileName: true } },
          jobDescription: { select: { id: true, title: true, company: true } },
        },
      });

      return sendSuccess(res, { matches }, 'Match reports retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve match reports', 500, error.message);
    }
  }

  /**
   * Get specific match report by ID
   */
  public static async getMatchById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const match = await prisma.matchReport.findFirst({
        where: { id, userId },
        include: {
          resume: true,
          jobDescription: true,
        },
      });

      if (!match) {
        return sendError(res, 'Match report not found', 404);
      }

      return sendSuccess(res, { match }, 'Match report retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve match report', 500, error.message);
    }
  }
}
