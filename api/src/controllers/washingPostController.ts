import { Request, Response } from 'express';
import { z } from 'zod';
import washingPostService from '../services/washingPostService';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * Схемы валидации для моечных постов
 */
const createWashingPostSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    order: z.number().int().optional(),
    serviceIds: z.array(z.string().uuid()).optional(),
  }),
});

const updateWashingPostSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    order: z.number().int().optional(),
    serviceIds: z.array(z.string().uuid()).optional(),
  }),
});

/**
 * Контроллер для работы с моечными постами
 */
class WashingPostController {
  /**
   * Получение всех постов
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const posts = await washingPostService.getAllPosts();
      res.json(posts);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Создание поста
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const post = await washingPostService.createPost(req.body);
      res.status(201).json(post);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Обновление поста
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const post = await washingPostService.updatePost(req.params.id, req.body);
      res.json(post);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Удаление поста
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await washingPostService.deletePost(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }
}

export default new WashingPostController();
export { createWashingPostSchema, updateWashingPostSchema };


