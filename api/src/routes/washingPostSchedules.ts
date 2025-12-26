import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import washingPostScheduleController, {
  getSchedulesSchema,
  upsertScheduleSchema,
} from '../controllers/washingPostScheduleController';

const router = Router();

router.get('/', authenticateAdmin, validate(getSchedulesSchema), washingPostScheduleController.getByDate);
router.post('/upsert', authenticateAdmin, validate(upsertScheduleSchema), washingPostScheduleController.upsert);

export default router;


