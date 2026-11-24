import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';
import { checkDatabaseConnection } from './config/db.js';

const app = createApp();

const server = app.listen(ENV.PORT, async () => {
  logger.info(`SkillBridge AI Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
  logger.info(`Health check available at: http://localhost:${ENV.PORT}/api/health`);

  // Check database connectivity asynchronously
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    logger.info('Database status: PostgreSQL connection verified.');
  } else {
    logger.warn(`Database status: ${dbStatus.message}`);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});
