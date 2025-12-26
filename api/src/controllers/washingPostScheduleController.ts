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

const copyDaySchema = z.object({
  body: z.object({
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    overwrite: z.boolean().optional(),
    copySlots: z.boolean().optional(),
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

  async copyDay(req: Request, res: Response): Promise<void> {
    try {
      const result = await washingPostScheduleService.copyDay({
        fromDate: new Date(`${req.body.fromDate}T00:00:00`),
        toDate: new Date(`${req.body.toDate}T00:00:00`),
        overwrite: req.body.overwrite ?? false,
        copySlots: req.body.copySlots ?? true,
      });
      res.json(result);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }
}

export default new WashingPostScheduleController();
export { getSchedulesSchema, upsertScheduleSchema, copyDaySchema };


