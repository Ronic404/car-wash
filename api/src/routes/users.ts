import { Router } from 'express';
import userService from '../services/userService';
import { getErrorMessage } from '../utils/errorUtils';

const router = Router();

/**
 * @swagger
 * /api/users/telegram:
 *   post:
 *     summary: Получение или создание пользователя по Telegram ID
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telegramId
 *             properties:
 *               telegramId:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пользователь найден или создан
 */
router.post('/telegram', async (req, res) => {
  try {
    const user = await userService.getOrCreateUser(req.body);
    res.json(user);
  } catch (error: unknown) {
    res.status(400).json({ error: getErrorMessage(error) });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получение пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error: unknown) {
    res.status(404).json({ error: getErrorMessage(error) });
  }
});

export default router;
