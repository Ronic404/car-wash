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
 * @route   GET /api/cars/user/:userId
 * @desc    Получение автомобилей пользователя
 * @access  Public (для Telegram бота)
 */
router.get('/user/:userId', carController.getUserCars);

/**
 * @route   GET /api/cars/:id
 * @desc    Получение автомобиля по ID
 * @access  Public
 */
router.get('/:id', carController.getById);

/**
 * @route   PATCH /api/cars/:id
 * @desc    Обновление автомобиля
 * @access  Public (для Telegram бота)
 */
router.patch('/:id', carController.update);

/**
 * @route   DELETE /api/cars/:id
 * @desc    Удаление автомобиля
 * @access  Public (для Telegram бота)
 */
router.delete('/:id', carController.delete);

export default router;

