import prisma from '../config/database';
import logger from '../config/logger';

type Interval = { start: Date; end: Date };

function overlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000);
}

function dayStart(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function getMaxServiceDurationMinutes(service: { servicePrices: { duration: number }[] }): number {
  if (!service.servicePrices || service.servicePrices.length === 0) return 60;
  return Math.max(...service.servicePrices.map((sp) => sp.duration));
}

/**
 * Расчёт доступного времени по расписаниям постов, существующим записям и блокировкам.
 * Возвращает возможные старты с шагом 30 минут.
 */
class AvailabilityService {
  async getAvailability(options: {
    dateFrom: Date;
    dateTo: Date;
    serviceId: string;
    stepMinutes?: number;
  }): Promise<Array<{ postId: string; postName: string; postOrder: number; startAt: string }>> {
    const stepMinutes = options.stepMinutes ?? 30;
    try {
      // Длительность услуги: максимальная по категориям
      const service = await prisma.service.findUnique({
        where: { id: options.serviceId },
        include: { servicePrices: true },
      });
      if (!service || !service.isActive) {
        return [];
      }
      const durationMinutes = getMaxServiceDurationMinutes(service);

      // Собираем активные расписания по диапазону
      const schedules = await prisma.washingPostSchedule.findMany({
        where: {
          date: { gte: dayStart(options.dateFrom), lte: options.dateTo },
          isActive: true,
          post: {
            isActive: true,
            services: { some: { serviceId: options.serviceId } },
          },
        },
        include: { post: true },
        orderBy: [{ date: 'asc' }, { post: { order: 'asc' } }],
      });

      if (schedules.length === 0) return [];

      const postIds = Array.from(new Set(schedules.map((s) => s.postId)));

      // Блокировки в диапазоне
      const blocks = await prisma.timeBlock.findMany({
        where: {
          postId: { in: postIds },
          startAt: { lt: options.dateTo },
          endAt: { gt: options.dateFrom },
        },
        select: { postId: true, startAt: true, endAt: true },
      });

      // Бронирования в диапазоне (PENDING/CONFIRMED)
      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          postId: { in: postIds },
          startAt: { lt: options.dateTo, gte: dayStart(options.dateFrom) },
        },
        select: { postId: true, startAt: true, durationMinutes: true },
      });

      // Индекс занятости по посту
      const busyByPost = new Map<string, Interval[]>();
      const pushBusy = (postId: string, interval: Interval) => {
        const list = busyByPost.get(postId) ?? [];
        list.push(interval);
        busyByPost.set(postId, list);
      };

      for (const b of blocks) {
        pushBusy(b.postId, { start: b.startAt, end: b.endAt });
      }

      for (const b of bookings) {
        const start = b.startAt;
        const end = addMinutes(start, b.durationMinutes);
        pushBusy(b.postId, { start, end });
      }

      // Для каждого расписания генерим старты с шагом 30 мин
      const result: Array<{ postId: string; postName: string; postOrder: number; startAt: string }> = [];

      for (const s of schedules) {
        const day = dayStart(s.date);

        // Конвертируем workFrom/To в реальные Date
        const windowStart = addMinutes(day, s.workFromMinutes);
        const windowEnd = addMinutes(day, s.workToMinutes);

        // Ограничение общим диапазоном запроса
        const rangeStart = options.dateFrom > windowStart ? options.dateFrom : windowStart;
        const rangeEnd = options.dateTo < windowEnd ? options.dateTo : windowEnd;

        if (rangeEnd <= rangeStart) continue;

        // Округляем старт вверх до ближайшего шага
        let cursor = new Date(rangeStart);
        const minutesFromDayStart = Math.floor((cursor.getTime() - day.getTime()) / 60000);
        const remainder = minutesFromDayStart % stepMinutes;
        if (remainder !== 0) {
          cursor = addMinutes(cursor, stepMinutes - remainder);
        }

        const busy = busyByPost.get(s.postId) ?? [];

        while (addMinutes(cursor, durationMinutes) <= rangeEnd) {
          const candidate: Interval = { start: cursor, end: addMinutes(cursor, durationMinutes) };

          const hasOverlap = busy.some((x) => overlap(x, candidate));
          if (!hasOverlap) {
            result.push({
              postId: s.postId,
              postName: s.post.name,
              postOrder: s.post.order,
              startAt: cursor.toISOString(),
            });
          }

          cursor = addMinutes(cursor, stepMinutes);
        }
      }

      return result;
    } catch (error) {
      logger.error('Ошибка расчёта доступного времени', { error, options });
      throw error;
    }
  }
}

export default new AvailabilityService();


