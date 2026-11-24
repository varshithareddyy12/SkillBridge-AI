import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { sendError } from './utils/response.js';
import { ENV } from './config/env.js';

export function createApp(): Express {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // CORS configuration
  const allowedOrigins = ENV.ALLOWED_ORIGINS;
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly fallback
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate Limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
  });
  app.use(limiter);

  // Request Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Root welcome check
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'SkillBridge AI Career Intelligence API',
      version: '1.0.0',
      tagline: "Don't just discover whether you're job-ready. Discover exactly how to become job-ready.",
      status: 'ONLINE',
      docs: '/api/health',
    });
  });

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Handle 404
  app.use((_req: Request, res: Response) => {
    sendError(res, 'The requested API endpoint was not found.', 404);
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
