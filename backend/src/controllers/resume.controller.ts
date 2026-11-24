import { Response } from 'express';
import { prisma } from '../config/db.js';
import { ResumeParserService } from '../services/resume-parser.service.js';
import { MatchingEngineService } from '../services/matching-engine.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ParsedResumeData } from '../types/index.js';

export class ResumeController {
  /**
   * Upload and process resume file
   */
  public static async uploadResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      if (!req.file) {
        return sendError(res, 'Please select a resume file (PDF, DOCX, or TXT) to upload.', 400);
      }

      const { originalname, mimetype, buffer } = req.file;

      // Process file through parser
      const { rawText, parsedData } = await ResumeParserService.processResume(
        buffer,
        mimetype,
        originalname
      );

      // Check if user has any existing resumes to set primary default
      const existingCount = await prisma.resume.count({ where: { userId } });
      const isPrimary = existingCount === 0;

      // Save to database
      const resume = await prisma.resume.create({
        data: {
          userId,
          title: originalname.replace(/\.[^/.]+$/, ''),
          fileName: originalname,
          fileType: mimetype,
          rawText,
          parsedData: parsedData as any,
          isPrimary,
        },
      });

      // Synchronize extracted skills into Skill and UserSkill catalog
      if (parsedData.skills && Array.isArray(parsedData.skills)) {
        for (const s of parsedData.skills) {
          if (s && s.name) {
            const normalized = MatchingEngineService.normalizeSkillName(s.name);
            try {
              const skillRecord = await prisma.skill.upsert({
                where: { normalizedName: normalized },
                update: {},
                create: {
                  name: s.name.trim(),
                  normalizedName: normalized,
                  category: s.category || 'Technical',
                },
              });

              await prisma.userSkill.upsert({
                where: {
                  userId_skillId: {
                    userId,
                    skillId: skillRecord.id,
                  },
                },
                update: {
                  verificationSource: 'RESUME_EXTRACTED',
                },
                create: {
                  userId,
                  skillId: skillRecord.id,
                  proficiencyLevel: s.proficiency || 'INTERMEDIATE',
                  verificationSource: 'RESUME_EXTRACTED',
                  yearsExperience: parsedData.totalYearsExperience || 1.0,
                },
              });
            } catch (err) {
              // Non-blocking skill sync error
            }
          }
        }
      }

      // Record activity
      await prisma.activity.create({
        data: {
          userId,
          type: 'RESUME_UPLOADED',
          title: `Uploaded Resume: ${originalname}`,
          description: `Extracted ${(parsedData.skills || []).length} technical competencies and background credentials.`,
          metadata: { resumeId: resume.id },
        },
      });

      return sendSuccess(res, { resume }, 'Resume uploaded and analyzed successfully', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to upload or analyze resume', 500, error.message);
    }
  }

  /**
   * Get all resumes for authenticated user
   */
  public static async getResumes(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const resumes = await prisma.resume.findMany({
        where: { userId },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          fileName: true,
          fileType: true,
          isPrimary: true,
          parsedData: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return sendSuccess(res, { resumes }, 'Resumes retrieved successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch resumes', 500, error.message);
    }
  }

  /**
   * Get specific resume by ID with ownership check
   */
  public static async getResumeById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const resume = await prisma.resume.findFirst({
        where: { id, userId },
      });

      if (!resume) {
        return sendError(res, 'Resume not found or unauthorized access', 404);
      }

      return sendSuccess(res, { resume }, 'Resume details retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch resume', 500, error.message);
    }
  }

  /**
   * Update resume title, parsed skills, or toggle primary
   */
  public static async updateResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { title, isPrimary, parsedData } = req.body;

      const existing = await prisma.resume.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return sendError(res, 'Resume not found or unauthorized access', 404);
      }

      // If setting this resume as primary, unmark others
      if (isPrimary) {
        await prisma.resume.updateMany({
          where: { userId, NOT: { id } },
          data: { isPrimary: false },
        });
      }

      const updated = await prisma.resume.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(isPrimary !== undefined ? { isPrimary } : {}),
          ...(parsedData ? { parsedData: parsedData as any } : {}),
        },
      });

      return sendSuccess(res, { resume: updated }, 'Resume updated successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to update resume', 500, error.message);
    }
  }

  /**
   * Delete resume with ownership check
   */
  public static async deleteResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const existing = await prisma.resume.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return sendError(res, 'Resume not found or unauthorized', 404);
      }

      await prisma.resume.delete({
        where: { id },
      });

      // If deleted resume was primary, set the most recent one as primary
      if (existing.isPrimary) {
        const nextResume = await prisma.resume.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (nextResume) {
          await prisma.resume.update({
            where: { id: nextResume.id },
            data: { isPrimary: true },
          });
        }
      }

      return sendSuccess(res, null, 'Resume deleted successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to delete resume', 500, error.message);
    }
  }
}
