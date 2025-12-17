import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Middleware для обработки ошибок
 * Логирует все ошибки и отправляет безопасный ответ клиенту
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Ошибка обработки запроса', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // В production не отправляем stack trace
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    ...(isDevelopment && { details: err.message, stack: err.stack }),
  });
};

/**
 * Middleware для обработки 404 ошибок
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.warn('Маршрут не найден', {
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.path,
  });
};

