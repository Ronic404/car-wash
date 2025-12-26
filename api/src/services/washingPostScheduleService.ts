import prisma from '../config/database';
import logger from '../config/logger';

function getDayRange(date: Date): { from: Date; to: Date } {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

/**
 * Сервис для работы с расписанием постов по дням
 */
class WashingPostScheduleService {
  async getSchedulesByDate(date: Date) {
    try {
      const { from, to } = getDayRange(date);
      const schedules = await prisma.washingPostSchedule.findMany({
        where: {
          date: { gte: from, lte: to },
        },
        include: {
          post: true,
        },
        orderBy: [{ post: { order: 'asc' } }],
      });
      return schedules;
    } catch (error) {
      logger.error('Ошибка получения расписаний', { error, date });
      throw error;
    }
  }

  async upsertSchedule(data: {
    postId: string;
    date: Date;
    isActive: boolean;
    workFromMinutes: number;
    workToMinutes: number;
  }) {
    try {
      const day = new Date(data.date);
      day.setHours(0, 0, 0, 0);

      const schedule = await prisma.washingPostSchedule.upsert({
        where: {
          postId_date: {
            postId: data.postId,
            date: day,
          },
        },
        update: {
          isActive: data.isActive,
          workFromMinutes: data.workFromMinutes,
          workToMinutes: data.workToMinutes,
        },
        create: {
          postId: data.postId,
          date: day,
          isActive: data.isActive,
          workFromMinutes: data.workFromMinutes,
          workToMinutes: data.workToMinutes,
        },
        include: { post: true },
      });

      return schedule;
    } catch (error) {
      logger.error('Ошибка upsert расписания', { error, data });
      throw error;
    }
  }
}

export default new WashingPostScheduleService();
