import { Router } from 'express';
import adminController, { loginSchema, registerSchema } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Регистрация нового администратора
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Администратор успешно создан
 *       400:
 *         description: Ошибка валидации или администратор уже существует
 */
router.post('/register', validate(registerSchema), adminController.register);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Вход администратора
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 admin:
 *                   type: object
 *       401:
 *         description: Неверный email или пароль
 */
router.post('/login', validate(loginSchema), adminController.login);

/**
 * @swagger
 * /api/admin/me:
 *   get:
 *     summary: Получение информации о текущем администраторе
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация об администраторе
 *       401:
 *         description: Не авторизован
 */
router.get('/me', authenticateAdmin, adminController.getMe);

export default router;

