import { Request, Response } from 'express';
import { z } from 'zod';
import serviceService from '../services/serviceService';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * Схемы валидации для услуг
 */
const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    duration: z.number().int().positive(),
    order: z.number().int().optional(),
  }),
});

const updateServicePriceSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    categoryId: z.string().uuid(),
    price: z.number().positive(),
  }),
});

const bulkUpdateServicePricesSchema = z.object({
  body: z.object({
    prices: z.array(
      z.object({
        serviceId: z.string().uuid(),
        categoryId: z.string().uuid(),
        price: z.number().positive(),
      })
    ),
  }),
});

const updateServicesOrderSchema = z.object({
  body: z.object({
    services: z.array(
      z.object({
        id: z.string().uuid(),
        order: z.number().int(),
      })
    ),
  }),
});

/**
 * Контроллер для работы с услугами
 */
class ServiceController {
  /**
   * Получение всех активных услуг
   */
  async getActive(req: Request, res: Response): Promise<void> {
    try {
      const services = await serviceService.getActiveServices();
      res.json(services);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Получение всех услуг (для администраторов)
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const services = await serviceService.getAllServices();
      res.json(services);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Получение услуги по ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      res.json(service);
    } catch (error: unknown) {
      res.status(404).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Создание новой услуги
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const service = await serviceService.createService(req.body);
      res.status(201).json(service);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Обновление услуги
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const service = await serviceService.updateService(req.params.id, req.body);
      res.json(service);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Удаление услуги
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await serviceService.deleteService(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Создание или обновление цены услуги для категории
   */
  async upsertServicePrice(req: Request, res: Response): Promise<void> {
    try {
      const servicePrice = await serviceService.upsertServicePrice(req.body);
      res.json(servicePrice);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Массовое обновление цен услуг
   */
  async bulkUpdateServicePrices(req: Request, res: Response): Promise<void> {
    try {
      await serviceService.bulkUpdateServicePrices(req.body.prices);
      res.json({ success: true });
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Удаление цены услуги для категории
   */
  async deleteServicePrice(req: Request, res: Response): Promise<void> {
    try {
      await serviceService.deleteServicePrice(
        req.params.serviceId,
        req.params.categoryId
      );
      res.status(204).send();
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Изменение порядка услуг
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      await serviceService.updateServicesOrder(req.body.services);
      res.json({ success: true });
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Получение таблицы услуг (матрица услуга-категория)
   */
  async getTable(req: Request, res: Response): Promise<void> {
    try {
      const table = await serviceService.getServicesTable();
      res.json(table);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }
}

export {
  createServiceSchema,
  updateServicePriceSchema,
  bulkUpdateServicePricesSchema,
  updateServicesOrderSchema,
};
export default new ServiceController();

