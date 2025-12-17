import { Router } from 'express';
import carController, { createCarSchema } from '../controllers/carController';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/cars
 * @desc    Создание нового автомобиля
 * @access  Public (для Telegram бота)
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

