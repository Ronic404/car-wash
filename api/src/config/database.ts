import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import logger from './logger';

/**
 * Prisma клиент для работы с базой данных
 * Singleton паттерн для переиспользования соединения
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Логирование запросов в development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Логирование ошибок
prisma.$on('error', (e) => {
  logger.error('Prisma Error', { error: e });
});

// Логирование предупреждений
prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', { warning: e });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});

export default prisma;

