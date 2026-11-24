import { PrismaClient } from '@prisma/client';
import { ENV } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma || new PrismaClient({
  log: ENV.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (ENV.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    if (!ENV.DATABASE_URL) {
      return {
        connected: false,
        message: 'DATABASE_URL environment variable is not configured. Please configure your Aiven PostgreSQL URL in .env',
      };
    }
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'Connected to PostgreSQL successfully.' };
  } catch (error: any) {
    return {
      connected: false,
      message: `Database connection error: ${error.message || 'Unable to connect to PostgreSQL.'}`,
    };
  }
}
