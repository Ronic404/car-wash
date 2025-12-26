import { Router } from 'express';
import bookingsRouter from './bookings';
import carsRouter from './cars';
import servicesRouter from './services';
import carCategoriesRouter from './carCategories';
import washingPostRouter from './washingPost';
import washingPostSchedulesRouter from './washingPostSchedules';
import timeBlocksRouter from './timeBlocks';
import availabilityRouter from './availability';
import adminRouter from './admin';
import usersRouter from './users';
import sseRouter from './sse';

const router = Router();

// API routes
router.use('/bookings', bookingsRouter);
router.use('/cars', carsRouter);
router.use('/services', servicesRouter);
router.use('/car-categories', carCategoriesRouter);
router.use('/washing-posts', washingPostRouter);
router.use('/washing-post-schedules', washingPostSchedulesRouter);
router.use('/time-blocks', timeBlocksRouter);
router.use('/availability', availabilityRouter);
router.use('/admin', adminRouter);
router.use('/users', usersRouter);
router.use('/sse', sseRouter);

export default router;

