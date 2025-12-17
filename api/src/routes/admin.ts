import { Router } from 'express';
import adminController, { loginSchema, registerSchema } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/admin/register
 * @desc    Регистрация нового администратора
 * @access  Public (только для первоначальной настройки)
 */
router.post('/register', validate(registerSchema), adminController.register);

/**
 * @route   POST /api/admin/login
 * @desc    Вход администратора
 * @access  Public
 */
router.post('/login', validate(loginSchema), adminController.login);

/**
 * @route   GET /api/admin/me
 * @desc    Получение информации о текущем администраторе
 * @access  Admin
 */
router.get('/me', authenticateAdmin, adminController.getMe);

export default router;

