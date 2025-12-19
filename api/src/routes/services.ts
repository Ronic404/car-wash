import { Router } from 'express';
import serviceController, { createServiceSchema } from '../controllers/serviceController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/services/active:
 *   get:
 *     summary: Получение всех активных услуг (для клиентов)
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Список активных услуг
 */
router.get('/active', serviceController.getActive);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Получение всех услуг (для администраторов)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список всех услуг
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateAdmin, serviceController.getAll);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Получение услуги по ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Информация об услуге
 *       404:
 *         description: Услуга не найдена
 */
router.get('/:id', serviceController.getById);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Создание новой услуги
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Услуга успешно создана
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.post('/', authenticateAdmin, validate(createServiceSchema), serviceController.create);

/**
 * @swagger
 * /api/services/{id}:
 *   patch:
 *     summary: Обновление услуги
 *     tags: [Services]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Услуга успешно обновлена
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.patch('/:id', authenticateAdmin, serviceController.update);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Удаление услуги
 *     tags: [Services]
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
 *         description: Услуга успешно удалена
 *       400:
 *         description: Ошибка удаления
 *       401:
 *         description: Не авторизован
 */
router.delete('/:id', authenticateAdmin, serviceController.delete);

export default router;

