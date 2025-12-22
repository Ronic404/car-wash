import { Router } from 'express';
import carCategoryController, {
  createCategorySchema,
  updateCategorySchema,
  updateOrderSchema,
} from '../controllers/carCategoryController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/car-categories:
 *   get:
 *     summary: Получение всех категорий автомобилей
 *     tags: [CarCategories]
 *     responses:
 *       200:
 *         description: Список всех категорий
 */
router.get('/', carCategoryController.getAll);

/**
 * @swagger
 * /api/car-categories/active:
 *   get:
 *     summary: Получение активных категорий автомобилей
 *     tags: [CarCategories]
 *     responses:
 *       200:
 *         description: Список активных категорий
 */
router.get('/active', carCategoryController.getActive);

/**
 * @swagger
 * /api/car-categories/{id}:
 *   get:
 *     summary: Получение категории по ID
 *     tags: [CarCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Информация о категории
 *       404:
 *         description: Категория не найдена
 */
router.get('/:id', carCategoryController.getById);

/**
 * @swagger
 * /api/car-categories:
 *   post:
 *     summary: Создание новой категории автомобиля
 *     tags: [CarCategories]
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
 *             properties:
 *               name:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Категория успешно создана
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.post(
  '/',
  authenticateAdmin,
  validate(createCategorySchema),
  carCategoryController.create
);

/**
 * @swagger
 * /api/car-categories/{id}:
 *   patch:
 *     summary: Обновление категории автомобиля
 *     tags: [CarCategories]
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
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Категория успешно обновлена
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.patch(
  '/:id',
  authenticateAdmin,
  validate(updateCategorySchema),
  carCategoryController.update
);

/**
 * @swagger
 * /api/car-categories/{id}:
 *   delete:
 *     summary: Удаление категории автомобиля
 *     tags: [CarCategories]
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
 *         description: Категория успешно удалена
 *       400:
 *         description: Ошибка удаления
 *       401:
 *         description: Не авторизован
 */
router.delete('/:id', authenticateAdmin, carCategoryController.delete);

/**
 * @swagger
 * /api/car-categories/order:
 *   patch:
 *     summary: Изменение порядка категорий
 *     tags: [CarCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categories
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Порядок успешно обновлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.patch(
  '/order',
  authenticateAdmin,
  validate(updateOrderSchema),
  carCategoryController.updateOrder
);

export default router;

