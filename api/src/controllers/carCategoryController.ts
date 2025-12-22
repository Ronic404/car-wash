import { Request, Response } from 'express';
import carCategoryService from '../services/carCategoryService';
import { z } from 'zod';

/**
 * Схемы валидации для категорий
 */
const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateOrderSchema = z.object({
  body: z.object({
    categories: z.array(
      z.object({
        id: z.string().uuid(),
        order: z.number().int(),
      })
    ),
  }),
});

/**
 * Контроллер для работы с категориями автомобилей
 */
class CarCategoryController {
  /**
   * Получение всех категорий
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await carCategoryService.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Получение активных категорий
   */
  async getActive(req: Request, res: Response): Promise<void> {
    try {
      const categories = await carCategoryService.getActiveCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Получение категории по ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const category = await carCategoryService.getCategoryById(
        req.params.id
      );
      res.json(category);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Создание новой категории
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const category = await carCategoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Обновление категории
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const category = await carCategoryService.updateCategory(
        req.params.id,
        req.body
      );
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Удаление категории
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await carCategoryService.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Изменение порядка категорий
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      await carCategoryService.updateCategoriesOrder(req.body.categories);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CarCategoryController();
export { createCategorySchema, updateCategorySchema, updateOrderSchema };

