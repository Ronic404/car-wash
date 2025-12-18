import { Router } from 'express';
import bookingsRouter from './bookings';
import slotsRouter from './slots';
import carsRouter from './cars';
import servicesRouter from './services';
import adminRouter from './admin';
import usersRouter from './users';
import sseRouter from './sse';

const router = Router();

// API routes
router.use('/bookings', bookingsRouter);
router.use('/slots', slotsRouter);
router.use('/cars', carsRouter);
router.use('/services', servicesRouter);
router.use('/admin', adminRouter);
router.use('/users', usersRouter);
router.use('/sse', sseRouter);

export default router;

