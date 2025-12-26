import { Request, Response } from 'express';
import { z } from 'zod';
import bookingService from '../services/bookingService';
import sseService from '../services/sseService';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * Схемы валидации для записей
 */
const createBookingByTimeSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    carId: z.string().uuid(),
    serviceId: z.string().uuid(),
    postId: z.string().uuid(),
    startAt: z.string().datetime(),
    notes: z.string().optional(),
  }),
});

const getBookingsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    userId: z.string().uuid().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

const getUserBookingsSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

/**
 * Контроллер для работы с записями
 */
class BookingController {
  /**
   * Создание записи по времени (новый поток)
   */
  async createByTime(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.createBookingByTime({
        userId: req.body.userId,
        carId: req.body.carId,
        serviceId: req.body.serviceId,
        postId: req.body.postId,
        startAt: new Date(req.body.startAt),
        notes: req.body.notes,
      });
      sseService.notifyNewBooking(booking);
      res.status(201).json(booking);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Получение всех записей с фильтрами
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: {
        status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
        userId?: string;
        dateFrom?: Date;
        dateTo?: Date;
      } = {};

      if (req.query.status) {
        filters.status = req.query.status as typeof filters.status;
      }

      if (req.query.userId) {
        filters.userId = req.query.userId as string;
      }

      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }

      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      const bookings = await bookingService.getBookings(filters);
      res.json(bookings);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Получение записей пользователя (для telegram-bot, без админ-авторизации)
   */
  async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = getUserBookingsSchema.parse({ params: req.params }).params;
      const bookings = await bookingService.getBookings({ userId });
      res.json(bookings);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Получение записи по ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.getBookingById(req.params.id);
      res.json(booking);
    } catch (error: unknown) {
      res.status(404).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Подтверждение записи
   */
  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.confirmBooking(req.params.id);
      // Отправляем уведомление через SSE
      sseService.notifyBookingUpdate(booking);
      res.json(booking);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Отмена записи
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.cancelBooking(req.params.id);
      // Отправляем уведомление через SSE
      sseService.notifyBookingUpdate(booking);
      res.json(booking);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Завершение записи
   */
  async complete(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.completeBooking(req.params.id);
      // Отправляем уведомление через SSE
      sseService.notifyBookingUpdate(booking);
      res.json(booking);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }
}

export { createBookingByTimeSchema, getBookingsSchema, getUserBookingsSchema };
export default new BookingController();

