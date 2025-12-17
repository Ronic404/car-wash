import { Router } from 'express';
import userService from '../services/userService';

const router = Router();

/**
 * @route   POST /api/users/telegram
 * @desc    Получение или создание пользователя по Telegram ID
 * @access  Public (для Telegram бота)
 */
router.post('/telegram', async (req, res) => {
  try {
    const user = await userService.getOrCreateUser(req.body);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Получение пользователя по ID
 * @access  Public (для Telegram бота)
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
