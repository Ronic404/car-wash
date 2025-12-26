import { Request, Response } from 'express';
import { z } from 'zod';
import availabilityService from '../services/availabilityService';
import { getErrorMessage } from '../utils/errorUtils';

export const getAvailabilitySchema = z.object({
  query: z.object({
    dateFrom: z.string().datetime(),
    dateTo: z.string().datetime(),
    serviceId: z.string().uuid(),
  }),
});

class AvailabilityController {
  async get(req: Request, res: Response): Promise<void> {
    try {
      const dateFrom = new Date(req.query.dateFrom as string);
      const dateTo = new Date(req.query.dateTo as string);
      const serviceId = req.query.serviceId as string;

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


