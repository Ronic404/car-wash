import prisma from '../config/database';
import logger from '../config/logger';
import { BookingStatus } from '@prisma/client';

function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000);
}

function dayStart(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function overlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Сервис для работы с записями
 */
class BookingService {
  /**
   * Создание записи по времени (новый поток: услуга -> время -> авто)
   * - проверяет расписание поста на день
   * - проверяет пересечения с записями (по длительности=max по категориям)
   * - проверяет пересечения с блокировками (TimeBlock)
   * - создаёт Booking
   */
  async createBookingByTime(data: {
    userId: string;
    carId: string;
    serviceId: string;
    postId: string;
    startAt: Date;
    notes?: string | null;
    confirmImmediately?: boolean;
  }) {
    try {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
      });
      if (!service || !service.isActive) {
        throw new Error('Услуга недоступна');
      }
      const endAt = addMinutes(data.startAt, service.duration);

      // Проверяем, что услуга разрешена на посту
      const allowed = await prisma.washingPostService.findUnique({
        where: {
          postId_serviceId: { postId: data.postId, serviceId: data.serviceId },
        },
      });
      if (!allowed) {
        throw new Error('Услуга недоступна на выбранном посту');
      }

      // Проверяем расписание на день
      const day = dayStart(data.startAt);
      const schedule = await prisma.washingPostSchedule.findUnique({
        where: { postId_date: { postId: data.postId, date: day } },
      });
      if (!schedule) {
        throw new Error('Пост недоступен в выбранный день');
      }
      if (!schedule.isActive) {
        throw new Error('Пост неактивен в выбранный день');
      }

      const minutes = data.startAt.getHours() * 60 + data.startAt.getMinutes();
      if (
        minutes < schedule.workFromMinutes ||
        minutes + service.duration > schedule.workToMinutes
      ) {
        throw new Error('Время вне часов работы поста');
      }

      // Пересечения с блокировками
      const blocks = await prisma.timeBlock.findMany({
        where: {
          postId: data.postId,
          startAt: { lt: endAt },
          endAt: { gt: data.startAt },
        },
        select: { startAt: true, endAt: true },
      });
      if (blocks.some((b) => overlap(b.startAt, b.endAt, data.startAt, endAt))) {
        throw new Error('Время занято (блокировка)');
      }

      // Пересечения с записями (PENDING/CONFIRMED) по посту за день
      const dayEnd = addMinutes(day, 24 * 60);
      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          postId: data.postId,
          startAt: { gte: day, lt: dayEnd },
        },
        select: { startAt: true, durationMinutes: true },
      });
      const hasBookingOverlap = bookings.some((b) => {
        const bStart = b.startAt;
        const bEnd = addMinutes(bStart, b.durationMinutes);
        return overlap(bStart, bEnd, data.startAt, endAt);
      });
      if (hasBookingOverlap) {
        throw new Error('Время занято (есть запись)');
      }

      const booking = await prisma.booking.create({
        data: {
          userId: data.userId,
          carId: data.carId,
          serviceId: data.serviceId,
          postId: data.postId,
          startAt: data.startAt,
          durationMinutes: service.duration,
          notes: data.notes,
          status: data.confirmImmediately ? 'CONFIRMED' : 'PENDING',
          ...(data.confirmImmediately ? { confirmedAt: new Date() } : {}),
        },
        include: {
          user: true,
          car: true,
          service: { include: { servicePrices: true } },
          post: true,
        },
      });

      logger.info('Создана новая запись (by-time)', { bookingId: booking.id });
      return booking;
    } catch (error) {
      logger.error('Ошибка создания записи (by-time)', { error, data });
      throw error;
    }
  }

  /**
   * Получение всех записей с фильтрами
   */
  async getBookings(filters: {
    status?: BookingStatus;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    try {
      const where: NonNullable<Parameters<typeof prisma.booking.findMany>[0]>['where'] = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.startAt = {
          ...(filters.dateFrom && { gte: filters.dateFrom }),
          ...(filters.dateTo && { lte: filters.dateTo }),
        };
      }

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          user: true,
          car: true,
          service: { include: { servicePrices: true } },
          post: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return bookings;
    } catch (error) {
      logger.error('Ошибка получения записей', { error, filters });
      throw error;
    }
  }

  /**
   * Получение записи по ID
   */
  async getBookingById(id: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          car: true,
          service: { include: { servicePrices: true } },
          post: true,
        },
      });

      if (!booking) {
        throw new Error('Запись не найдена');
      }

      return booking;
    } catch (error) {
      logger.error('Ошибка получения записи', { error, bookingId: id });
      throw error;
    }
  }

  /**
   * Подтверждение записи
   */
  async confirmBooking(id: string) {
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
        include: {
          user: true,
          car: true,
          service: { include: { servicePrices: true } },
          post: true,
        },
      });

      logger.info('Запись подтверждена', { bookingId: id });
      return booking;
    } catch (error) {
      logger.error('Ошибка подтверждения записи', { error, bookingId: id });
      throw error;
    }
  }

  /**
   * Отмена записи
   */
  async cancelBooking(id: string) {
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: {
          user: true,
          car: true,
          service: { include: { servicePrices: true } },
          post: true,
        },
      });

      logger.info('Запись отменена', { bookingId: id });
      return booking;
    } catch (error) {
      logger.error('Ошибка отмены записи', { error, bookingId: id });
      throw error;
    }
  }

  /**
   * Завершение записи
   */
  async completeBooking(id: string) {
    try {
      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'COMPLETED',
        },
        include: {
          user: true,
          car: true,
          service: { include: { servicePrices: true } },
          post: true,
        },
      });

      logger.info('Запись завершена', { bookingId: id });
      return booking;
    } catch (error) {
      logger.error('Ошибка завершения записи', { error, bookingId: id });
      throw error;
    }
  }
}

export default new BookingService();

