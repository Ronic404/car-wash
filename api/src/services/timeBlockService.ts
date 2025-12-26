import prisma from '../config/database';
import logger from '../config/logger';

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000);
}

/**
 * Сервис для блокировок времени/ручных записей
 */
class TimeBlockService {
  async getByRange(filters: { dateFrom: Date; dateTo: Date; postId?: string }) {
    try {
      const blocks = await prisma.timeBlock.findMany({
        where: {
          ...(filters.postId ? { postId: filters.postId } : {}),
          startAt: { lt: filters.dateTo },
          endAt: { gt: filters.dateFrom },
        },
        include: {
          post: true,
          service: true,
        },
        orderBy: [{ startAt: 'asc' }],
      });
      return blocks;
    } catch (error) {
      logger.error('Ошибка получения блокировок', { error, filters });
      throw error;
    }
  }

  async create(data: {
    postId: string;
    startAt: Date;
    endAt: Date;
    kind: 'BLOCK' | 'MANUAL_BOOKING';
    serviceId?: string | null;
    carBrand?: string | null;
    carModel?: string | null;
    note?: string | null;
  }) {
    try {
      if (data.endAt <= data.startAt) {
        throw new Error('endAt должен быть больше startAt');
      }

      // Проверка пересечений с существующими блокировками
      const existing = await prisma.timeBlock.findMany({
        where: {
          postId: data.postId,
          startAt: { lt: data.endAt },
          endAt: { gt: data.startAt },
        },
        select: { id: true, startAt: true, endAt: true },
      });
      if (existing.some((b) => overlap(b.startAt, b.endAt, data.startAt, data.endAt))) {
        throw new Error('Есть пересечение с существующей блокировкой');
      }

      // Проверка пересечений с бронированиями (PENDING/CONFIRMED)
      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          postId: data.postId,
          startAt: { lt: data.endAt },
        },
        select: { startAt: true, durationMinutes: true },
      });

      const hasBookingOverlap = bookings.some((b) => {
        const start = b.startAt;
        const end = addMinutes(start, b.durationMinutes);
        return overlap(start, end, data.startAt, data.endAt);
      });
      if (hasBookingOverlap) {
        throw new Error('Есть пересечение с существующей записью');
      }

      const block = await prisma.timeBlock.create({
        data: {
          postId: data.postId,
          startAt: data.startAt,
          endAt: data.endAt,
          kind: data.kind,
          serviceId: data.serviceId ?? null,
          carBrand: data.carBrand ?? null,
          carModel: data.carModel ?? null,
          note: data.note ?? null,
        },
        include: { post: true, service: true },
      });

      logger.info('Создана блокировка', { blockId: block.id, postId: data.postId });
      return block;
    } catch (error) {
      logger.error('Ошибка создания блокировки', { error, data });
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await prisma.timeBlock.delete({ where: { id } });
      logger.info('Блокировка удалена', { blockId: id });
    } catch (error) {
      logger.error('Ошибка удаления блокировки', { error, id });
      throw error;
    }
  }
}

export default new TimeBlockService();


