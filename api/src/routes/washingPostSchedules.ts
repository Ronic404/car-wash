import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import washingPostScheduleController, {
  getSchedulesSchema,
  upsertScheduleSchema,
  copyDaySchema,
} from '../controllers/washingPostScheduleController';

const router = Router();

router.get('/', authenticateAdmin, validate(getSchedulesSchema), washingPostScheduleController.getByDate);
router.post('/upsert', authenticateAdmin, validate(upsertScheduleSchema), washingPostScheduleController.upsert);
router.post('/copy-day', authenticateAdmin, validate(copyDaySchema), washingPostScheduleController.copyDay);

export default router;


