import prisma from '../config/database';
import logger from '../config/logger';
import { BookingStatus } from '@prisma/client';

/**
 * Сервис для работы с записями
 */
class BookingService {
  /**
   * Создание новой записи
   */
  async createBooking(data: {
    userId: string;
    carId: string;
    serviceId: string;
    slotId: string;
    notes?: string;
  }) {
    try {
      // Проверяем доступность слота
      const slot = await prisma.timeSlot.findUnique({
        where: { id: data.slotId },
      });

      if (!slot || !slot.isAvailable) {
        throw new Error('Слот недоступен');
      }

      // Проверяем количество существующих записей в этом слоте
      const existingBookings = await prisma.booking.count({
        where: {
          slotId: data.slotId,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      });

      if (existingBookings >= slot.maxBookings) {
        throw new Error('Слот уже занят');
      }

      const booking = await prisma.booking.create({
        data: {
          userId: data.userId,
          carId: data.carId,
          serviceId: data.serviceId,
          slotId: data.slotId,
          notes: data.notes,
          status: 'PENDING',
        },
        include: {
          user: true,
          car: true,
          service: true,
          slot: true,
        },
      });

      logger.info('Создана новая запись', { bookingId: booking.id });
      return booking;
    } catch (error) {
      logger.error('Ошибка создания записи', { error, data });
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
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.slot = {
          date: {
            ...(filters.dateFrom && { gte: filters.dateFrom }),
            ...(filters.dateTo && { lte: filters.dateTo }),
          },
        };
      }

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          user: true,
          car: true,
          service: true,
          slot: true,
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
          service: true,
          slot: true,
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
          service: true,
          slot: true,
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
          service: true,
          slot: true,
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
          service: true,
          slot: true,
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

