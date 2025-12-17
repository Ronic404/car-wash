import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../config/logger';

/**
 * Middleware для валидации запросов с использованием Zod
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Ошибка валидации', {
          errors: error.errors,
          path: req.path,
        });

        res.status(400).json({
          error: 'Ошибка валидации',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};

