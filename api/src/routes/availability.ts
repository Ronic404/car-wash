import { Router } from 'express';
import { validate } from '../middleware/validation';
import availabilityController, { getAvailabilitySchema } from '../controllers/availabilityController';

const router = Router();

/**
 * @swagger
 * /api/availability:
 *   get:
 *     summary: Подбор доступного времени под услугу (client/bot)
 *     tags: [Availability]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: dateFrom
 *         required: false
 *         description: Начало диапазона (ISO). Если не передано — используется текущее время.
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         required: false
 *         description: Конец диапазона (ISO). Если не передано — используется dateFrom + 30 дней.
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Список доступных стартов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   postId:
 *                     type: string
 *                   postName:
 *                     type: string
 *                   postOrder:
 *                     type: integer
 *                   startAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', validate(getAvailabilitySchema), availabilityController.get);

export default router;


