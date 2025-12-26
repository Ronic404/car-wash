import { Router } from 'express';
import washingPostController, {
  createWashingPostSchema,
  updateWashingPostSchema,
} from '../controllers/washingPostController';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/washing-posts:
 *   get:
 *     summary: Получение всех моечных постов
 *     tags: [WashingPosts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список постов
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateAdmin, washingPostController.getAll);

/**
 * @swagger
 * /api/washing-posts/active:
 *   get:
 *     summary: Получение активных моечных постов
 *     tags: [WashingPosts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список активных постов
 *       401:
 *         description: Не авторизован
 */
router.get('/active', authenticateAdmin, washingPostController.getActive);

/**
 * @swagger
 * /api/washing-posts:
 *   post:
 *     summary: Создание моечного поста
 *     tags: [WashingPosts]
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
 *         description: Пост успешно создан
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.post(
  '/',
  authenticateAdmin,
  validate(createWashingPostSchema),
  washingPostController.create
);

/**
 * @swagger
 * /api/washing-posts/{id}:
 *   patch:
 *     summary: Обновление моечного поста
 *     tags: [WashingPosts]
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
 *         description: Пост успешно обновлен
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
router.patch(
  '/:id',
  authenticateAdmin,
  validate(updateWashingPostSchema),
  washingPostController.update
);

/**
 * @swagger
 * /api/washing-posts/{id}:
 *   delete:
 *     summary: Удаление моечного поста
 *     tags: [WashingPosts]
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
 *         description: Пост успешно удален
 *       400:
 *         description: Ошибка удаления
 *       401:
 *         description: Не авторизован
 */
router.delete('/:id', authenticateAdmin, washingPostController.delete);

export default router;


