import { Response } from 'express';
import { prisma } from '../config/db.js';
import { MatchingEngineService } from '../services/matching-engine.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class SkillController {
  /**
   * Get all skills for current user with verification status and proficiency
   */
  public static async getUserSkills(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const userSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
        orderBy: [{ proficiencyLevel: 'desc' }, { createdAt: 'desc' }],
      });

      return sendSuccess(res, { userSkills }, 'User skills retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch user skills', 500, error.message);
    }
  }

  /**
   * Add a custom self-reported skill
   */
  public static async addSkill(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { name, category, proficiencyLevel, yearsExperience } = req.body;
      const normalized = MatchingEngineService.normalizeSkillName(name);

      const skill = await prisma.skill.upsert({
        where: { normalizedName: normalized },
        update: {},
        create: {
          name: name.trim(),
          normalizedName: normalized,
          category: category || 'Technical',
        },
      });

      const userSkill = await prisma.userSkill.upsert({
        where: {
          userId_skillId: {
            userId,
            skillId: skill.id,
          },
        },
        update: {
          proficiencyLevel: proficiencyLevel || 'INTERMEDIATE',
          yearsExperience: yearsExperience || 1,
        },
        create: {
          userId,
          skillId: skill.id,
          proficiencyLevel: proficiencyLevel || 'INTERMEDIATE',
          verificationSource: 'SELF_REPORTED', // explicitly self-reported!
          yearsExperience: yearsExperience || 1,
        },
        include: { skill: true },
      });

      return sendSuccess(res, { userSkill }, 'Skill added successfully', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to add skill', 500, error.message);
    }
  }

  /**
   * Update skill proficiency and verification status
   */
  public static async updateSkill(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);
      const { id } = req.params;
      const { proficiencyLevel, verificationSource, yearsExperience } = req.body;

      const userSkill = await prisma.userSkill.findFirst({
        where: { id, userId },
      });

      if (!userSkill) {
        return sendError(res, 'Skill entry not found', 404);
      }

      const updated = await prisma.userSkill.update({
        where: { id },
        data: {
          ...(proficiencyLevel ? { proficiencyLevel } : {}),
          ...(verificationSource ? { verificationSource } : {}),
          ...(yearsExperience !== undefined ? { yearsExperience } : {}),
        },
        include: { skill: true },
      });

      await prisma.activity.create({
        data: {
          userId,
          type: 'SKILL_UPDATED',
          title: `Updated Skill: ${updated.skill.name}`,
          description: `Proficiency adjusted to ${updated.proficiencyLevel} (${updated.verificationSource}).`,
        },
      });

      return sendSuccess(res, { userSkill: updated }, 'Skill updated successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to update skill', 500, error.message);
    }
  }

  /**
   * Comprehensive Skill Gap Analysis aggregated across all analyzed jobs vs user skills
   */
  public static async getSkillGaps(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      // 1. Fetch user skills
      const userSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });

      const userSkillNames = new Set(
        userSkills.map(us => MatchingEngineService.normalizeSkillName(us.skill.name))
      );

      // 2. Fetch all analyzed jobs for the user
      const jobs = await prisma.jobDescription.findMany({
        where: { userId },
      });

      // 3. Count frequency of required skills across jobs
      const skillFrequencyMap = new Map<string, { count: number; name: string }>();

      for (const job of jobs) {
        const parsed = job.parsedData as any;
        if (parsed?.requiredSkills && Array.isArray(parsed.requiredSkills)) {
          for (const s of parsed.requiredSkills) {
            const norm = MatchingEngineService.normalizeSkillName(s);
            const existing = skillFrequencyMap.get(norm);
            if (existing) {
              existing.count += 1;
            } else {
              skillFrequencyMap.set(norm, { count: 1, name: s });
            }
          }
        }
      }

      // If no jobs analyzed yet, populate a default market baseline
      if (skillFrequencyMap.size === 0) {
        const baseline = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'Git', 'AWS'];
        for (const s of baseline) {
          skillFrequencyMap.set(MatchingEngineService.normalizeSkillName(s), { count: 1, name: s });
        }
      }

      // 4. Categorize skills into Acquired, In-Progress, and Missing Gaps
      const acquiredSkills: any[] = [];
      const missingSkills: any[] = [];

      for (const [norm, { count, name }] of skillFrequencyMap.entries()) {
        if (userSkillNames.has(norm)) {
          const userSkill = userSkills.find(
            us => MatchingEngineService.normalizeSkillName(us.skill.name) === norm
          );
          acquiredSkills.push({
            name,
            frequencyInJobs: count,
            proficiency: userSkill?.proficiencyLevel || 'INTERMEDIATE',
            verificationSource: userSkill?.verificationSource || 'SELF_REPORTED',
            isVerified: ['PROJECT_VERIFIED', 'ASSESSMENT_VERIFIED'].includes(
              userSkill?.verificationSource || ''
            ),
          });
        } else {
          // Priority calculation: higher frequency in jobs = higher priority
          let priority = 'MEDIUM';
          if (count >= 2 || count === jobs.length) priority = 'HIGH';
          else if (count === 1 && jobs.length > 3) priority = 'LOW';

          missingSkills.push({
            name,
            frequencyInJobs: count,
            marketDemandPercentage: Math.min(100, Math.round((count / Math.max(jobs.length, 1)) * 100)),
            learningPriority: priority,
            importanceExplanation: `Found in ${count} of your analyzed target roles. Demonstrating capability in ${name} directly unlocks these opportunities.`,
          });
        }
      }

      // Sort missing skills by frequency descending
      missingSkills.sort((a, b) => b.frequencyInJobs - a.frequencyInJobs);

      return sendSuccess(
        res,
        {
          totalAnalyzedJobs: jobs.length,
          acquiredSkillsCount: acquiredSkills.length,
          missingSkillsCount: missingSkills.length,
          acquiredSkills,
          missingSkills,
        },
        'Skill gap analysis computed'
      );
    } catch (error: any) {
      return sendError(res, 'Failed to compute skill gaps', 500, error.message);
    }
  }
}
