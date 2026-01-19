import { Router } from 'express';
import bookingController, {
  createBookingByTimeSchema,
  getBookingsSchema,
  getUserBookingsSchema,
} from '../controllers/bookingController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/bookings/by-time:
 *   post:
 *     summary: Создание записи по времени (услуга -> время -> пост -> авто)
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
 *               - postId
 *               - startAt
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
 *               postId:
 *                 type: string
 *                 format: uuid
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Запись успешно создана
 *       400:
 *         description: Ошибка валидации или время недоступно
 */
router.post('/by-time', validate(createBookingByTimeSchema), bookingController.createByTime);

/**
 * @swagger
 * /api/bookings/by-time/admin:
 *   post:
 *     summary: Создание записи администратором по времени (сразу подтверждена)
 *     description: |
 *       Создаёт запись через админ-панель и сразу выставляет статус CONFIRMED (confirmedAt заполняется автоматически).
 *       Используйте этот endpoint для записей, созданных администратором. Записи клиентов через бот создавайте через `/api/bookings/by-time` (они будут PENDING).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *               - postId
 *               - startAt
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
 *               postId:
 *                 type: string
 *                 format: uuid
 *               startAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Запись успешно создана и подтверждена (CONFIRMED)
 *       400:
 *         description: Ошибка валидации или время недоступно
 *       401:
 *         description: Не авторизован
 */
// Создание записи администратором (сразу подтверждена)
router.post(
  '/by-time/admin',
  authenticateAdmin,
  validate(createBookingByTimeSchema),
  bookingController.createByTimeAdmin
);

/**
 * @swagger
 * /api/bookings/user/{userId}:
 *   get:
 *     summary: Получение записей пользователя (для telegram-bot)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Список записей пользователя
 *       400:
 *         description: Ошибка валидации
 */
router.get('/user/:userId', validate(getUserBookingsSchema), bookingController.getByUser);

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

