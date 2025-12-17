import { Request, Response } from 'express';
import carService from '../services/carService';
import { z } from 'zod';

/**
 * Схемы валидации для автомобилей
 */
const createCarSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    brand: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    color: z.string().optional(),
    licensePlate: z.string().optional(),
  }),
});

/**
 * Контроллер для работы с автомобилями
 */
class CarController {
  /**
   * Создание нового автомобиля
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const car = await carService.createCar(req.body);
      res.status(201).json(car);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Получение автомобилей пользователя
   */
  async getUserCars(req: Request, res: Response): Promise<void> {
    try {
      const cars = await carService.getUserCars(req.params.userId);
      res.json(cars);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Получение автомобиля по ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const car = await carService.getCarById(req.params.id);
      res.json(car);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Обновление автомобиля
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const car = await carService.updateCar(req.params.id, req.body);
      res.json(car);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Удаление автомобиля
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await carService.deleteCar(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export { createCarSchema };
export default new CarController();

