import { Request, Response } from 'express';
import { z } from 'zod';
import timeBlockService from '../services/timeBlockService';
import { getErrorMessage } from '../utils/errorUtils';

const getBlocksSchema = z.object({
  query: z.object({
    dateFrom: z.string().datetime(),
    dateTo: z.string().datetime(),
    postId: z.string().uuid().optional(),
  }),
});

const createBlockSchema = z.object({
  body: z.object({
    postId: z.string().uuid(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    kind: z.enum(['BLOCK', 'MANUAL_BOOKING']).optional(),
    serviceId: z.string().uuid().optional().nullable(),
    carBrand: z.string().min(1).optional().nullable(),
    carModel: z.string().min(1).optional().nullable(),
    note: z.string().optional().nullable(),
  }),
});

class TimeBlockController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const dateFrom = new Date(req.query.dateFrom as string);
      const dateTo = new Date(req.query.dateTo as string);
      const postId = typeof req.query.postId === 'string' ? req.query.postId : undefined;
      const blocks = await timeBlockService.getByRange({ dateFrom, dateTo, postId });
      res.json(blocks);
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const block = await timeBlockService.create({
        postId: req.body.postId,
        startAt: new Date(req.body.startAt),
        endAt: new Date(req.body.endAt),
        kind: req.body.kind ?? 'BLOCK',
        serviceId: req.body.serviceId ?? null,
        carBrand: req.body.carBrand ?? null,
        carModel: req.body.carModel ?? null,
        note: req.body.note ?? null,
      });
      res.status(201).json(block);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await timeBlockService.delete(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error) });
    }
  }
}

export default new TimeBlockController();
export { getBlocksSchema, createBlockSchema };


