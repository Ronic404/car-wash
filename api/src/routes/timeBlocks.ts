import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import timeBlockController, { createBlockSchema, getBlocksSchema } from '../controllers/timeBlockController';

const router = Router();

router.get('/', authenticateAdmin, validate(getBlocksSchema), timeBlockController.getAll);
router.post('/', authenticateAdmin, validate(createBlockSchema), timeBlockController.create);
router.delete('/:id', authenticateAdmin, timeBlockController.delete);

export default router;


