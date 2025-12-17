import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

/**
 * Интерфейс для JWT payload
 */
interface ITokenPayload {
  adminId: string;
  email: string;
}

/**
 * Расширение типа Request для добавления информации об администраторе
 */
declare global {
  namespace Express {
    interface Request {
      admin?: ITokenPayload;
    }
  }
}

/**
 * Middleware для проверки JWT токена администратора
 */
export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Токен не предоставлен' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT_SECRET не установлен в переменных окружения');
      res.status(500).json({ error: 'Ошибка конфигурации сервера' });
      return;
    }

    const decoded = jwt.verify(token, secret) as ITokenPayload;
    req.admin = decoded;
    next();
  } catch (error) {
    logger.warn('Ошибка аутентификации', { error, path: req.path });
    res.status(401).json({ error: 'Недействительный токен' });
  }
};

