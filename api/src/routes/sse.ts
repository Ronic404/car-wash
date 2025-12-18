import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sseService from '../services/sseService';
import logger from '../config/logger';

const router = Router();

/**
 * Middleware для аутентификации через query параметр (для SSE)
 */
const authenticateSSE = (req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET не установлен в переменных окружения');
      return res.status(500).json({ error: 'Ошибка конфигурации сервера' });
    }

    const decoded = jwt.verify(token, secret);
    (req as any).admin = decoded;
    next();
  } catch (error) {
    logger.error('Ошибка аутентификации SSE', { error });
    return res.status(401).json({ error: 'Недействительный токен' });
  }
};

/**
 * @swagger
 * /sse/events:
 *   get:
 *     summary: Подключение к Server-Sent Events для real-time уведомлений
 *     tags: [SSE]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT токен для аутентификации
 *     responses:
 *       200:
 *         description: SSE соединение установлено
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: 'data: {"type":"connected","data":{"timestamp":"2024-01-01T00:00:00.000Z"}}'
 */
router.get('/events', authenticateSSE, (req: Request, res: Response) => {
  sseService.addClient(res);
});

export default router;

