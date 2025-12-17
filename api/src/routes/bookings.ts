import { Router } from 'express';
import bookingController, { createBookingSchema, getBookingsSchema } from '../controllers/bookingController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Создание новой записи
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - carId
 *               - serviceId
 *               - slotId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               carId:
 *                 type: string
 *                 format: uuid
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *               slotId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Запись успешно создана
 *       400:
 *         description: Ошибка валидации или слот недоступен
 */
router.post('/', validate(createBookingSchema), bookingController.create);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Получение всех записей с фильтрами
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Список записей
 */
router.get('/', authenticateAdmin, validate(getBookingsSchema), bookingController.getAll);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Получение записи по ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Информация о записи
 *       404:
 *         description: Запись не найдена
 */
router.get('/:id', authenticateAdmin, bookingController.getById);

/**
 * @swagger
 * /api/bookings/{id}/confirm:
 *   patch:
 *     summary: Подтверждение записи
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Запись подтверждена
 *       400:
 *         description: Ошибка подтверждения
 */
router.patch('/:id/confirm', authenticateAdmin, bookingController.confirm);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Отмена записи
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Запись отменена
 *       400:
 *         description: Ошибка отмены
 */
router.patch('/:id/cancel', authenticateAdmin, bookingController.cancel);

/**
 * @swagger
 * /api/bookings/{id}/complete:
 *   patch:
 *     summary: Завершение записи
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Запись завершена
 *       400:
 *         description: Ошибка завершения
 */
router.patch('/:id/complete', authenticateAdmin, bookingController.complete);

export default router;

