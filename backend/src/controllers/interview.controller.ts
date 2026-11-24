import { Response } from 'express';
import { prisma } from '../config/db.js';
import { InterviewService } from '../services/interview.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class InterviewController {
  /**
   * Create a new mock interview session and generate questions
   */
  public static async startSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { title, category, targetRole, difficulty, questionCount } = req.body;

      // Generate questions
      const generatedQuestions = await InterviewService.generateQuestions(
        category || 'TECHNICAL',
        targetRole,
        difficulty || 'MID',
        questionCount || 5
      );

      // Create session in PostgreSQL
      const session = await prisma.interviewSession.create({
        data: {
          userId,
          title: title || `${category} Interview: ${targetRole}`,
          category: category || 'TECHNICAL',
          targetRole,
          difficulty: difficulty || 'MID',
          questions: {
            create: generatedQuestions.map((q) => ({
              questionText: q.questionText,
              orderIndex: q.orderIndex,
              idealAnswerPoints: q.idealAnswerPoints as any,
              rubric: q.rubric as any,
            })),
          },
        },
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' },
            include: { answers: true },
          },
        },
      });

      return sendSuccess(res, { session }, 'Interview session initialized', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to start interview session', 500, error.message);
    }
  }

  /**
   * Get all interview sessions for user
   */
  public static async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const sessions = await prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          questions: {
            include: {
              answers: {
                where: { userId },
              },
            },
          },
        },
      });

      return sendSuccess(res, { sessions }, 'Interview sessions retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve sessions', 500, error.message);
    }
  }

  /**
   * Get specific session details
   */
  public static async getSessionById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const session = await prisma.interviewSession.findFirst({
        where: { id, userId },
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' },
            include: {
              answers: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!session) {
        return sendError(res, 'Interview session not found', 404);
      }

      return sendSuccess(res, { session }, 'Session details retrieved');
    } catch (error: any) {
      return sendError(res, 'Failed to fetch interview session', 500, error.message);
    }
  }

  /**
   * Submit an answer for evaluation
   */
  public static async submitAnswer(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { id: sessionId } = req.params;
      const { questionId, userText } = req.body;

      // Verify session ownership
      const session = await prisma.interviewSession.findFirst({
        where: { id: sessionId, userId },
      });
      if (!session) {
        return sendError(res, 'Session not found or unauthorized', 404);
      }

      // Fetch question
      const question = await prisma.interviewQuestion.findFirst({
        where: { id: questionId, sessionId },
      });
      if (!question) {
        return sendError(res, 'Question not found in this session', 404);
      }

      // Evaluate answer using rubric & AI / fallback
      const evaluation = await InterviewService.evaluateAnswer(
        question.questionText,
        question.idealAnswerPoints as string[],
        question.rubric,
        userText
      );

      // Save answer in PostgreSQL
      const answer = await prisma.interviewAnswer.create({
        data: {
          questionId,
          userId,
          userText,
          score: evaluation.overallScore,
          relevanceScore: evaluation.relevanceScore,
          technicalScore: evaluation.technicalScore,
          clarityScore: evaluation.clarityScore,
          depthScore: evaluation.depthScore,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths as any,
          weaknesses: evaluation.weaknesses as any,
          improvementSuggestions: evaluation.improvementSuggestions,
        },
      });

      // Update session overall score
      const allAnswers = await prisma.interviewAnswer.findMany({
        where: {
          question: { sessionId },
          userId,
        },
      });

      const avgScore = Math.round(
        allAnswers.reduce((acc, a) => acc + a.score, 0) / allAnswers.length
      );

      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          overallScore: avgScore,
          feedbackSummary: `Completed ${allAnswers.length} answers with an average evaluation score of ${avgScore}%.`,
        },
      });

      // Activity log
      await prisma.activity.create({
        data: {
          userId,
          type: 'INTERVIEW_COMPLETED',
          title: `Answered Interview Question`,
          description: `Score: ${evaluation.overallScore}% on "${question.questionText.slice(0, 50)}..."`,
          metadata: { sessionId, questionId, score: evaluation.overallScore },
        },
      });

      return sendSuccess(res, { answer, evaluation }, 'Answer evaluated successfully', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to evaluate answer', 500, error.message);
    }
  }
}
