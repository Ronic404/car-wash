import { Request, Response } from 'express';
import { z } from 'zod';
import washingPostScheduleService from '../services/washingPostScheduleService';
import { getErrorMessage } from '../utils/errorUtils';

const getSchedulesSchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const upsertScheduleSchema = z.object({
  body: z.object({
    postId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isActive: z.boolean(),
    workFromMinutes: z.number().int().min(0).max(24 * 60),
    workToMinutes: z.number().int().min(0).max(24 * 60),
  }),
});

class WashingPostScheduleController {
  async getByDate(req: Request, res: Response): Promise<void> {
    try {
      const date = new Date(`${req.query.date as string}T00:00:00`);
      const schedules = await washingPostScheduleService.getSchedulesByDate(date);
      res.json(schedules);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  async upsert(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await washingPostScheduleService.upsertSchedule({
        postId: req.body.postId,
        date: new Date(`${req.body.date}T00:00:00`),
        isActive: req.body.isActive,
        workFromMinutes: req.body.workFromMinutes,
        workToMinutes: req.body.workToMinutes,
      });
      res.json(schedule);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }
}

export default new WashingPostScheduleController();
export { getSchedulesSchema, upsertScheduleSchema };


