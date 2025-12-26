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

  async copyDay(data: {
    fromDate: Date;
    toDate: Date;
    overwrite: boolean;
    copySlots: boolean;
  }): Promise<{ schedulesCopied: number; slotsCopied: number }> {
    try {
      const fromDay = new Date(data.fromDate);
      fromDay.setHours(0, 0, 0, 0);
      const toDay = new Date(data.toDate);
      toDay.setHours(0, 0, 0, 0);

      const { from: fromRangeFrom, to: fromRangeTo } = getDayRange(fromDay);
      const schedules = await prisma.washingPostSchedule.findMany({
        where: { date: { gte: fromRangeFrom, lte: fromRangeTo } },
      });

      let schedulesCopied = 0;
      for (const s of schedules) {
        if (data.overwrite) {
          await prisma.washingPostSchedule.upsert({
            where: { postId_date: { postId: s.postId, date: toDay } },
            update: {
              isActive: s.isActive,
              workFromMinutes: s.workFromMinutes,
              workToMinutes: s.workToMinutes,
            },
            create: {
              postId: s.postId,
              date: toDay,
              isActive: s.isActive,
              workFromMinutes: s.workFromMinutes,
              workToMinutes: s.workToMinutes,
            },
          });
          schedulesCopied++;
        } else {
          const existing = await prisma.washingPostSchedule.findUnique({
            where: { postId_date: { postId: s.postId, date: toDay } },
          });
          if (!existing) {
            await prisma.washingPostSchedule.create({
              data: {
                postId: s.postId,
                date: toDay,
                isActive: s.isActive,
                workFromMinutes: s.workFromMinutes,
                workToMinutes: s.workToMinutes,
              },
            });
            schedulesCopied++;
          }
        }
      }

      // В варианте B свободные слоты не создаются и не копируются.
      // Оставляем параметр copySlots для совместимости интерфейса, но всегда возвращаем 0.
      const slotsCopied = 0;

      logger.info('Копирование дня', { ...data, schedulesCopied, slotsCopied });
      return { schedulesCopied, slotsCopied };
    } catch (error) {
      logger.error('Ошибка копирования дня', { error, data });
      throw error;
    }
  }
}

export default new WashingPostScheduleService();


