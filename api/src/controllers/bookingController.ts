import { Request, Response } from 'express';
import bookingService from '../services/bookingService';
import wsService from '../websocket/server';
import { z } from 'zod';

/**
 * Схемы валидации для записей
 */
const createBookingSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    carId: z.string().uuid(),
    serviceId: z.string().uuid(),
    slotId: z.string().uuid(),
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

/**
 * Контроллер для работы с записями
 */
class BookingController {
  /**
   * Создание новой записи
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.createBooking(req.body);
      // Отправляем уведомление через WebSocket
      wsService.notifyNewBooking(booking);
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Получение всех записей с фильтрами
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};

      if (req.query.status) {
        filters.status = req.query.status;
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Получение записи по ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.getBookingById(req.params.id);
      res.json(booking);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Подтверждение записи
   */
  async confirm(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.confirmBooking(req.params.id);
      // Отправляем уведомление через WebSocket
      wsService.notifyBookingUpdate(booking);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Отмена записи
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.cancelBooking(req.params.id);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Завершение записи
   */
  async complete(req: Request, res: Response): Promise<void> {
    try {
      const booking = await bookingService.completeBooking(req.params.id);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export { createBookingSchema, getBookingsSchema };
export default new BookingController();

