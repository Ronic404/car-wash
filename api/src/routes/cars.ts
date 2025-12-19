import { Router } from 'express';
import carController, { createCarSchema } from '../controllers/carController';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Создание нового автомобиля
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - brand
 *               - model
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               color:
 *                 type: string
 *               licensePlate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Автомобиль успешно создан
 */
router.post('/', validate(createCarSchema), carController.create);

/**
 * @swagger
 * /api/cars/user/{userId}:
 *   get:
 *     summary: Получение автомобилей пользователя
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Список автомобилей пользователя
 *       500:
 *         description: Ошибка сервера
 */
router.get('/user/:userId', carController.getUserCars);

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Получение автомобиля по ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Информация об автомобиле
 *       404:
 *         description: Автомобиль не найден
 */
router.get('/:id', carController.getById);

/**
 * @swagger
 * /api/cars/{id}:
 *   patch:
 *     summary: Обновление автомобиля
 *     tags: [Cars]
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
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               color:
 *                 type: string
 *               licensePlate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Автомобиль успешно обновлен
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Автомобиль не найден
 */
router.patch('/:id', carController.update);

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Удаление автомобиля
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Автомобиль успешно удален
 *       400:
 *         description: Ошибка удаления
 */
router.delete('/:id', carController.delete);

export default router;

