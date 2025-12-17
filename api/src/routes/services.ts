import { Router } from 'express';
import serviceController, { createServiceSchema } from '../controllers/serviceController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/services/active
 * @desc    Получение всех активных услуг (для клиентов)
 * @access  Public
 */
router.get('/active', serviceController.getActive);

/**
 * @route   GET /api/services
 * @desc    Получение всех услуг (для администраторов)
 * @access  Admin
 */
router.get('/', authenticateAdmin, serviceController.getAll);

/**
 * @route   GET /api/services/:id
 * @desc    Получение услуги по ID
 * @access  Public
 */
router.get('/:id', serviceController.getById);

/**
 * @route   POST /api/services
 * @desc    Создание новой услуги
 * @access  Admin
 */
router.post('/', authenticateAdmin, validate(createServiceSchema), serviceController.create);

/**
 * @route   PATCH /api/services/:id
 * @desc    Обновление услуги
 * @access  Admin
 */
router.patch('/:id', authenticateAdmin, serviceController.update);

/**
 * @route   DELETE /api/services/:id
 * @desc    Удаление услуги
 * @access  Admin
 */
router.delete('/:id', authenticateAdmin, serviceController.delete);

export default router;

