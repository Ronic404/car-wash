import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import prisma from '../config/database';

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
declare module 'express-serve-static-core' {
  interface Request {
    admin?: ITokenPayload;
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

/**
 * Middleware: доступ только для main-администратора.
 * Проверяем роль в БД (не доверяем client-side).
 */
export const requireMainAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.admin?.adminId) {
      res.status(401).json({ error: 'Не авторизован' });
      return;
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.adminId },
      select: { id: true, isActive: true, role: true },
    });

    if (!admin || !admin.isActive) {
      res.status(401).json({ error: 'Не авторизован' });
      return;
    }

    if (admin.role !== 'MAIN') {
      res.status(403).json({ error: 'Недостаточно прав' });
      return;
    }

    next();
  } catch (error) {
    logger.warn('Ошибка проверки роли администратора', { error, path: req.path });
    res.status(500).json({ error: 'Ошибка проверки прав' });
  }
};

