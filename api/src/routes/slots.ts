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
 * @route   GET /api/slots
 * @desc    Получение всех слотов (для администраторов)
 * @access  Admin
 */
router.get('/', authenticateAdmin, slotController.getAll);

/**
 * @route   POST /api/slots
 * @desc    Создание нового слота
 * @access  Admin
 */
router.post('/', authenticateAdmin, validate(createSlotSchema), slotController.create);

/**
 * @route   PATCH /api/slots/:id
 * @desc    Обновление слота
 * @access  Admin
 */
router.patch('/:id', authenticateAdmin, slotController.update);

/**
 * @route   DELETE /api/slots/:id
 * @desc    Удаление слота
 * @access  Admin
 */
router.delete('/:id', authenticateAdmin, slotController.delete);

export default router;

