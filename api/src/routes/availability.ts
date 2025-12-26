import { Router } from 'express';
import { validate } from '../middleware/validation';
import availabilityController, { getAvailabilitySchema } from '../controllers/availabilityController';

const router = Router();

// Клиентский endpoint расчёта доступного времени
router.get('/', validate(getAvailabilitySchema), availabilityController.get);

export default router;


