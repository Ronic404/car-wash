import { Router } from 'express';
import slotController, { createSlotSchema, getSlotsSchema } from '../controllers/slotController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/slots/available:
 *   get:
 *     summary: Получение доступных слотов (для клиентов)
 *     tags: [Slots]
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Список доступных слотов
 */
router.get('/available', validate(getSlotsSchema), slotController.getAvailable);

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Получение всех слотов (для администраторов)
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Список всех слотов
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateAdmin, slotController.getAll);

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Создание нового слота
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *               maxBookings:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Слот успешно создан
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.post('/', authenticateAdmin, validate(createSlotSchema), slotController.create);

/**
 * @swagger
 * /api/slots/{id}:
 *   patch:
 *     summary: Обновление слота
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *               maxBookings:
 *                 type: integer
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Слот успешно обновлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.patch('/:id', authenticateAdmin, slotController.update);

/**
 * @swagger
 * /api/slots/{id}:
 *   delete:
 *     summary: Удаление слота
 *     tags: [Slots]
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
 *       204:
 *         description: Слот успешно удален
 *       400:
 *         description: Ошибка удаления
 *       401:
 *         description: Не авторизован
 */
router.delete('/:id', authenticateAdmin, slotController.delete);

export default router;

