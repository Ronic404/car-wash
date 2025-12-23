import { Request, Response } from 'express';
import { z } from 'zod';
import slotService from '../services/slotService';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * Схемы валидации для слотов
 */
const createSlotSchema = z.object({
  body: z.object({
    date: z.string().datetime(),
    duration: z.number().int().positive().optional(),
    maxBookings: z.number().int().positive().optional(),
  }),
});

const getSlotsSchema = z.object({
  query: z.object({
    dateFrom: z.string().datetime(),
    dateTo: z.string().datetime(),
  }),
});

/**
 * Контроллер для работы со слотами
 */
class SlotController {
  /**
   * Получение доступных слотов
   */
  async getAvailable(req: Request, res: Response): Promise<void> {
    try {
      const dateFrom = new Date(req.query.dateFrom as string);
      const dateTo = new Date(req.query.dateTo as string);

      if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
        res.status(400).json({ error: 'Неверный формат даты' });
        return;
      }

      const slots = await slotService.getAvailableSlots(dateFrom, dateTo);
      res.json(slots);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Получение всех слотов (для администраторов)
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {};

      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }

      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      if (req.query.isAvailable !== undefined) {
        filters.isAvailable = req.query.isAvailable === 'true';
      }

      const slots = await slotService.getAllSlots(filters);
      res.json(slots);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Создание нового слота
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const slot = await slotService.createSlot({
        date: new Date(req.body.date),
        duration: req.body.duration,
        maxBookings: req.body.maxBookings,
      });
      res.status(201).json(slot);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Обновление слота
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const updateData: any = {};

      if (req.body.date) {
        updateData.date = new Date(req.body.date);
      }

      if (req.body.duration !== undefined) {
        updateData.duration = req.body.duration;
      }

      if (req.body.maxBookings !== undefined) {
        updateData.maxBookings = req.body.maxBookings;
      }

      if (req.body.isAvailable !== undefined) {
        updateData.isAvailable = req.body.isAvailable;
      }

      const slot = await slotService.updateSlot(req.params.id, updateData);
      res.json(slot);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  /**
   * Удаление слота
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await slotService.deleteSlot(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }
}

export { createSlotSchema, getSlotsSchema };
export default new SlotController();

