import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/db.js';
import { isGeminiAvailable } from '../config/gemini.js';
import { sendSuccess } from '../utils/response.js';

export class HealthController {
  public static async check(_req: Request, res: Response) {
    const dbStatus = await checkDatabaseConnection();

    const healthData = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          connected: dbStatus.connected,
          message: dbStatus.message,
        },
        aiEngine: {
          configured: isGeminiAvailable(),
          provider: 'Google Gemini SDK (@google/genai)',
          fallbackActive: !isGeminiAvailable(),
        },
      },
    };

    return sendSuccess(res, healthData, 'SkillBridge AI API is healthy');
  }
}
