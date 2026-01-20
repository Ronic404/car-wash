import { Request, Response } from 'express';
import { z } from 'zod';
import availabilityService from '../services/availabilityService';
import { getErrorMessage } from '../utils/errorUtils';

export const getAvailabilitySchema = z.object({
  query: z.object({
    serviceId: z.string().uuid(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

class AvailabilityController {
  async get(req: Request, res: Response): Promise<void> {
    try {
      const serviceId = req.query.serviceId as string;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : new Date();
      // dateTo опционален: если не передан, считаем слоты "начиная с dateFrom" на разумный период вперёд
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : addDays(dateFrom, 30);

      const data = await availabilityService.getAvailability({
        dateFrom,
        dateTo,
        serviceId,
        stepMinutes: 30,
      });
      res.json(data);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }
}

export default new AvailabilityController();


