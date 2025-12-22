import { Router } from 'express';
import serviceController, {
  createServiceSchema,
  updateServicePriceSchema,
  bulkUpdateServicePricesSchema,
  updateServicesOrderSchema,
} from '../controllers/serviceController';
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
 * /api/services/table:
 *   get:
 *     summary: Получение таблицы услуг (матрица услуга-категория)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Таблица услуг с матрицей цен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       order:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       order:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *                 prices:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         serviceId:
 *                           type: string
 *                         categoryId:
 *                           type: string
 *                         price:
 *                           type: number
 *                           nullable: true
 *                         duration:
 *                           type: integer
 *                           nullable: true
 *       401:
 *         description: Не авторизован
 */
router.get('/table', authenticateAdmin, serviceController.getTable);

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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
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
 *               order:
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

/**
 * @swagger
 * /api/services/prices:
 *   post:
 *     summary: Создание или обновление цены услуги для категории
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
 *               - serviceId
 *               - categoryId
 *               - price
 *               - duration
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Цена успешно обновлена
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.post(
  '/prices',
  authenticateAdmin,
  validate(updateServicePriceSchema),
  serviceController.upsertServicePrice
);

/**
 * @swagger
 * /api/services/prices/bulk:
 *   patch:
 *     summary: Массовое обновление цен услуг
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
 *               - prices
 *             properties:
 *               prices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - serviceId
 *                     - categoryId
 *                     - price
 *                     - duration
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                       format: uuid
 *                     categoryId:
 *                       type: string
 *                       format: uuid
 *                     price:
 *                       type: number
 *                     duration:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Цены успешно обновлены
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.patch(
  '/prices/bulk',
  authenticateAdmin,
  validate(bulkUpdateServicePricesSchema),
  serviceController.bulkUpdateServicePrices
);

/**
 * @swagger
 * /api/services/{serviceId}/prices/{categoryId}:
 *   delete:
 *     summary: Удаление цены услуги для категории
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Цена успешно удалена
 *       400:
 *         description: Ошибка удаления
 *       401:
 *         description: Не авторизован
 */
router.delete(
  '/:serviceId/prices/:categoryId',
  authenticateAdmin,
  serviceController.deleteServicePrice
);

/**
 * @swagger
 * /api/services/order:
 *   patch:
 *     summary: Изменение порядка услуг
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
 *               - services
 *             properties:
 *               services:
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
  validate(updateServicesOrderSchema),
  serviceController.updateOrder
);

export default router;

