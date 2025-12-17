import { Router } from 'express';
import bookingController, { createBookingSchema, getBookingsSchema } from '../controllers/bookingController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/bookings
 * @desc    Создание новой записи
 * @access  Public (для Telegram бота)
 */
router.post('/', validate(createBookingSchema), bookingController.create);

/**
 * @route   GET /api/bookings
 * @desc    Получение всех записей с фильтрами
 * @access  Admin
 */
router.get('/', authenticateAdmin, validate(getBookingsSchema), bookingController.getAll);

/**
 * @route   GET /api/bookings/:id
 * @desc    Получение записи по ID
 * @access  Admin
 */
router.get('/:id', authenticateAdmin, bookingController.getById);

/**
 * @route   PATCH /api/bookings/:id/confirm
 * @desc    Подтверждение записи
 * @access  Admin
 */
router.patch('/:id/confirm', authenticateAdmin, bookingController.confirm);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Отмена записи
 * @access  Admin
 */
router.patch('/:id/cancel', authenticateAdmin, bookingController.cancel);

/**
 * @route   PATCH /api/bookings/:id/complete
 * @desc    Завершение записи
 * @access  Admin
 */
router.patch('/:id/complete', authenticateAdmin, bookingController.complete);

export default router;

