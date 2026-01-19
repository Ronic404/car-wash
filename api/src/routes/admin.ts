import { Router } from 'express';
import adminController, { loginSchema, registerSchema } from '../controllers/adminController';
import { authenticateAdmin, requireMainAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/admin/register-request:
 *   post:
 *     summary: Регистрация администратора (создание заявки)
 *     tags: [Admin]
 *     description: |
 *       Создаёт администратора со статусом "ожидает подтверждения" (isActive=false, role=REGULAR).
 *       Исключение: если это самый первый администратор в системе, он будет создан как MAIN и активный (bootstrap).
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
 *         description: Заявка создана (или создан первый MAIN-админ)
 *       400:
 *         description: Ошибка валидации или администратор уже существует
 */
router.post('/register-request', validate(registerSchema), adminController.registerRequest);

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

/**
 * @swagger
 * /api/admin/admins:
 *   get:
 *     summary: Получение списка администраторов (только main)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список администраторов
 *       403:
 *         description: Недостаточно прав
 */
router.get('/admins', authenticateAdmin, requireMainAdmin, adminController.getAllAdmins);

/**
 * @swagger
 * /api/admin/registration-requests:
 *   get:
 *     summary: Получение заявок на регистрацию (только main)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заявок
 *       403:
 *         description: Недостаточно прав
 */
router.get('/registration-requests', authenticateAdmin, requireMainAdmin, adminController.getRegistrationRequests);

/**
 * @swagger
 * /api/admin/admins/{id}/approve:
 *   patch:
 *     summary: Подтвердить заявку администратора (только main)
 *     tags: [Admin]
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
 *       200:
 *         description: Администратор подтверждён
 */
router.patch('/admins/:id/approve', authenticateAdmin, requireMainAdmin, adminController.approve);

/**
 * @swagger
 * /api/admin/admins/{id}/role:
 *   patch:
 *     summary: Изменить роль администратора (только main)
 *     tags: [Admin]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [MAIN, REGULAR]
 *     responses:
 *       200:
 *         description: Роль изменена
 *       400:
 *         description: Ошибка изменения роли
 */
router.patch('/admins/:id/role', authenticateAdmin, requireMainAdmin, adminController.setRole);

/**
 * @swagger
 * /api/admin/admins/{id}:
 *   delete:
 *     summary: Удалить администратора (только main; минимум один main должен оставаться)
 *     tags: [Admin]
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
 *         description: Удалён
 *       400:
 *         description: Ошибка удаления
 */
router.delete('/admins/:id', authenticateAdmin, requireMainAdmin, adminController.delete);

export default router;

